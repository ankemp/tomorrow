# Tomorrow (tmr.w)

A quick and easy self-hostable todo/reminder app with multi-device syncing and e2ee.

## Features

- **Simple and Intuitive:** Mobile-first design for a smooth user experience.
- **Privacy-Focused:**
  - **Fully Offline Mode:** Use tmr.w without any server interaction, keeping all data locally on your device.
  - **End-to-End Encryption (e2ee) Option:** Securely sync your data with e2ee using browser-based cryptography.
  - **Data Control:** Easily delete your data from the server at any time.
- **Flexible Syncing:**
  - **Multi-Device Sync:** Keep your tasks synchronized across all your devices.
  - **Choose Your Sync Mode:** Select between fully offline, plain text sync, or e2ee sync to suit your needs.
  - **Real-time Sync:** Powered by [SignalDB](https://github.com/maxnowack/signaldb/), syncing happens instantly.
  - **Easy Device Linking:** Connect devices quickly using QR codes.
- **Powerful Task Management:**
  - **Rich Task Details:** Add locations, durations, sub-tasks, attachments, and notes to your tasks.
  - **Search Functionality:** Quickly find the tasks you need.
  - **Browser-Based Reminders:** Get reminded of tasks directly in your browser (make sure browser notifications are enabled).
  - **Task Categories:** Organize tasks using pre-defined categories like Work, Personal, Shopping, and Health (user-defined categories coming soon).

### Things to Know About E2EE and Multi-Device Sync

**Please be aware of the following when using End-to-End Encryption (E2EE) with multi-device syncing:**

- **Toggling E2EE Can Disrupt Sync:** Switching E2EE on or off _after_ you have linked multiple devices can cause synchronization issues. Devices linked with differing E2EE settings (one on, one off) may lose sync capability.
- **Recommendation:**
  - **Decide E2EE preference upfront.** If you intend to use E2EE, enable it _before_ linking devices via QR code.
  - **Maintain consistent E2EE settings across devices.** If you need to change E2EE settings, apply the change to _all_ linked devices to ensure continued synchronization.
- **Future Improvement & Community Contributions:** We are aware of this limitation and are actively exploring solutions to make E2EE toggling more seamless in future releases. **We are also open to Pull Requests (PRs) from the community to help address this issue.** If you have ideas or contributions, please feel free to submit them!

## Installation

### Prerequisites

Before you begin, you need to have **Docker** installed on your system. Please refer to the official Docker documentation for installation instructions for your operating system: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

### Docker Deployment

The easiest way to run tmr.w is using Docker. Follow these steps:

1.  **Pull the Docker image:**

    ```bash
    docker pull YOUR_DOCKER_IMAGE_NAME_HERE
    ```

    - **TODO:** Replace `YOUR_DOCKER_IMAGE_NAME_HERE` with the actual name of your Docker image from your container registry (e.g., Docker Hub, GitHub Container Registry, etc.).

2.  **Run the Docker container:**

    ```bash
    docker run -d -p 8080:PORT -e PORT=8080 -e DB_PATH=/data/tmr_w.db -v host_data_volume:/data YOUR_DOCKER_IMAGE_NAME_HERE
    ```

    - **TODO:** Replace `YOUR_DOCKER_IMAGE_NAME_HERE` again with your Docker image name.
    - **Port Mapping:** The `-p 8080:PORT` part maps port `8080` on your host machine to the port that tmr.w uses inside the container. The container's internal port is configured by the `PORT` environment variable (see "Configuration" below). You can change `8080` on the host side if you need to use a different port.
    - **Data Persistence:** `-v host_data_volume:/data` mounts a volume. **You must replace `host_data_volume` with a path on your host machine where you want to store the tmr.w database file** (e.g., `$HOME/tmr_w_data` or `./tmr_w_data`). This ensures your data persists even if you stop or remove the Docker container. If you don't provide this volume, your data will be lost when the container is removed.

3.  **Access tmr.w:**

    Once the Docker container is running, you can access tmr.w in your web browser by navigating to: `http://localhost:8080` (or the port you specified in the `docker run` command).

### Configuration

You can configure tmr.w using the following environment variables when running the Docker container (using the `-e` flag in `docker run`):

- **`PORT`**: (Optional, default: `8080`) Specifies the port that the tmr.w server will listen on _inside_ the Docker container. Make sure the `-p` port mapping in your `docker run` command correctly maps this internal port to a port on your host machine.
- **`DB_PATH`**: (Optional, default: `/data/tmr_w.db`) Specifies the path to the SQLite database file _inside_ the Docker container. **It is highly recommended that you mount a host volume to the `/data` directory (as shown in the `docker run` example above) to persist your data.**

### Docker Compose (Contributions Welcome!)

Currently, a `docker-compose.yml` file is not provided. The project maintainers welcome community contributions to create and maintain a Docker Compose setup for easier deployment. If you are interested in contributing, please submit a Pull Request!

## Usage

### Getting Started - First Launch

When you access tmr.w in your browser for the first time on a device, you will see a brief welcome screen like this:

**TODO:** _Insert screenshot of the welcome screen here._ (e.g., `![Welcome Screen](path/to/welcome-screenshot.png)`)

This welcome screen gives you two main options:

- **"Sync with Existing Device":** Choose this if you have already set up tmr.w on another device and want to sync your tasks. This will guide you through the QR code device linking process (see "Multi-Device Sync" below).
- **"Start Fresh":** Select this to begin using tmr.w as a standalone, offline todo app on this device.

If you choose "Start Fresh" or after you have completed the syncing process, you will be taken to the main task list view.

### Adding a New Task

Adding tasks in tmr.w is designed to be quick and easy:

1.  **Tap the "New Task" button:** Located at the bottom of the screen (represented by a "+" icon).

2.  **Enter Task Details:** A new task creation screen will appear. Here you can enter:

    - **Task Title:** The main description of your task.
    - **Notes:** Add any extra details or context.
    - **Due Date/Time:** Set a deadline for your task.
    - **Reminders:** Configure browser-based reminders to notify you.
    - **Category:** Assign the task to a pre-defined category (Work, Personal, Shopping, Health).
    - **Location:** Associate a location with the task.
    - **Duration:** Estimate the time needed to complete the task.
    - **Sub-tasks:** Break down larger tasks into smaller steps.
    - **Attachments:** Add relevant files to your task.

    The interface is designed to be intuitive and mobile-friendly.

### Managing Your Tasks

The main task view in tmr.w is a **List View**, organized for clarity and focus:

- **Task Organization:** Tasks are grouped as follows:

  - **Overdue:** Tasks past their due date are shown at the top in red.
  - **Today:** Tasks due today.
  - **Tomorrow:** Tasks due tomorrow.
  - **Future:** Tasks due on dates after tomorrow.

- **Interacting with Tasks:**
  - **Mark Complete:** Tap the circle or checkbox next to a task to mark it as completed.
  - **Edit Task:** Tap on a task to open it and make changes to any of its details.
  - **Delete Task:** **Tap the "Delete" button** (located within the task editing view).
  - **Search:** Use the search bar (location?) to quickly find tasks by title or keywords.

### Multi-Device Sync

To enable multi-device syncing and link a new device to your existing tmr.w setup:

1.  **Navigate to Settings:** Open the **Settings menu** (located in the **top-right corner** of the application).
2.  **Select "Sync Preferences" (or similar):** Find the sync settings within the settings menu.
3.  **"Link New Device":** Choose the option to link a new device. This will display a QR code on your current device.
4.  **On the New Device:** On the device you want to link, open tmr.w in the browser. On the welcome screen, select "Sync with Existing Device".
5.  **Scan QR Code:** Use the new device to scan the QR code displayed on your original device. Follow the on-screen prompts to complete the linking process.

Within the Sync Preferences, you can also:

- **Choose Sync Mode:** Select between "Fully Offline", "Plain Text Sync", or "End-to-End Encryption (E2EE)" for your synced data. Remember to review the "Things to Know About E2EE and Multi-Device Sync" section in this README if you choose E2EE.
- **Manage Linked Devices:** (If applicable - can users see/manage linked devices?)

## Contributing

We welcome contributions of all kinds! Whether you're a seasoned developer, a designer, a tester, or just a user with a great idea, there are many ways you can help make tmr.w even better.

**How to Contribute:**

- **Bug Reports:** If you find a bug, please [open an issue on GitHub](https://github.com/ankemp/tomorrow/issues). Please be as detailed as possible in your report, including steps to reproduce the bug, your browser/device information, and any relevant error messages.
- **Feature Requests:** Have a great idea for a new feature or improvement? We'd love to hear it! Please [open an issue on GitHub](https://github.com/ankemp/tomorrow/issues) to suggest your feature.
- **Code Contributions:** Want to contribute code? Great!
  - Fork the repository.
  - Create a new branch for your feature or bug fix.
  - Make your changes and ensure they are well-tested.
  - Submit a Pull Request (PR) with a clear description of your changes.
- **Documentation:** Help us improve the documentation! If you find errors, areas for clarification, or think something is missing, please let us know or submit a PR with improvements.
- **Translations:** Help us translate tmr.w into other languages to make it accessible to a wider audience.

**Contribution Guidelines:**

For detailed guidelines on how to contribute, please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) file.

We appreciate your contributions to making tmr.w a better tool for everyone!

## Support & Community

Having trouble or have questions about tmr.w? We're here to help!

- **GitHub Issues:** The best place to get support, report bugs, or suggest new features is by [opening an issue on our GitHub repository](https://github.com/ankemp/tomorrow/issues). Please check if a similar issue already exists before creating a new one.

We are a small but growing community, and we appreciate your feedback and engagement!

## Roadmap & Future Enhancements

We have exciting plans for the future of tmr.w! Here are some of the features and improvements we are planning to work on:

- **Coming Soon:** (More details about future features and roadmap will be added here soon. Stay tuned!)

We are also very open to community suggestions and contributions to help shape the future direction of tmr.w.

## Built With

tmr.w is built with and relies on the following awesome open-source technologies and libraries:

- **[Angular](https://angular.io/)**: A powerful JavaScript framework for building web applications.
- **[Taiga UI](https://taiga-ui.dev/)**: A fully functional Angular UI library.
- **[NgRx](https://ngrx.io/)**: Reactive State for Angular.
- **[SignalDB](https://github.com/maxnowack/signaldb/)**: A library for local-first realtime databases.
- **[date-fns](https://date-fns.org/)**: Modern JavaScript date utility library.
- **[opfs-tools](https://github.com/hughfenghen/opfs-tools/)**: Tools for working with the Origin Private File System in browsers.
- **[Sequelize](https://sequelize.org/)**: A modern TypeScript and Node.js ORM.
- **[Nx](https://nx.dev/)**: Smart, Fast and Extensible Build System.

We are grateful to the developers and communities behind these projects!

## License

tmr.w is released under the **MIT License**.
