import { Injectable } from '@angular/core';
import { pipeline } from '@huggingface/transformers';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Task } from '@tmrw/data-access';

@Injectable()
export class SubtaskGenerationService {
  generation$ = from(pipeline('text-generation'));

  generateSubtasks(task: Task): Observable<string[]> {
    return this.generation$.pipe(
      switchMap((generation) => {
        const prompt = this.prompt(task);
        return from(generation(prompt));
        // TODO: Map to correct type
      }),
      switchMap((response) => {
        console.log('Response:', response);
        // Process the response to extract subtasks if needed
        return from(Promise.resolve([])); // Replace with actual processing logic
      }),
    );
  }

  private prompt(task: Task): string {
    let prompt = `
      You are an expert project manager AI. Your task is to break down a larger task into smaller, actionable subtasks.
      Analyze the following task:

      **Task Title:** ${task.title}
    `;

    if (task.description) {
      prompt += `
      **Task Description:** ${task.description}
      `;
    }

    prompt += `
      Based on the title and description, generate a list of 3-5 concise and helpful subtasks needed to complete the main task. The subtasks should be distinct steps towards the goal.

      Output the subtasks as a numbered list, with each subtask on a new line. Do not include any introductory text or explanations, only the list.

      Subtasks:
      1. ...
      2. ...
      3. ...
    `;

    return prompt;
  }
}
