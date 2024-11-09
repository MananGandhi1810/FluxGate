# Fluxgate

Fluxgate is a revolutionary self-hostable deployment platform that empowers developers to effortlessly deploy their GitHub repositories to self-hosted servers. With its intuitive interface and powerful automation capabilities, Fluxgate streamlines the entire deployment process from code to production.

## Key Features
- **Seamless GitHub Integration**: Fluxgate seamlessly integrates with GitHub, allowing developers to deploy their repositories with just a few clicks.
- **Automated Deployments**: Trigger deployments automatically on every push, ensuring the latest code is always in production.
- **Real-time Logs**: Monitor deployment status and view logs in real time for comprehensive visibility.
- **Natural Language Deployment**: Deploy your code using intuitive natural language commands like "deploy master branch of my repository".

Fluxgate leverages the Gemini 1.5 Flash model, allowing it to intelligently deploy code from GitHub repositories based on the project's structure. The system parses the code's file tree to determine the appropriate framework or language, then uses this information to decide deployment parameters such as branch and directory. This enables Fluxgate to deliver highly customized deployments without manual configuration.

## How It Works

Fluxgate seamlessly integrates with GitHub using OAuth 2.0. Once a repository is linked, Fluxgate attaches a WebHook that automatically triggers builds and deployments when changes are pushed. The platform can handle deployments from a specific branch or directory, allowing flexible deployment options for various project structures.

For demonstration, we use Microsoft Azure Virtual Machines, taking advantage of the $100 credits provided by the GitHub Education Pack.

## Technologies Used

-   Express.js
-   Next.js
-   PostgreSQL
-   Redis
-   Docker
-   Gemini 1.5 Flash
-   GitHub API
-   Resend

## Getting Started

To deploy Fluxgate on your server:

1. Clone the repository:
    ```bash
    git clone
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Copy the `.env.example` file to `.env` and fill in the required environment variables.

4. Run the development server:
    ```bash
    npm run dev
    ```

5. Navigate to `http://localhost:3000` to access the platform.

## Future Scope

- **Reverse Proxy Support**: Integrate with popular reverse proxies like Nginx and Apache to manage multiple deployments on a single server.

- **Custom Deployment Scripts**: Allow developers to define custom deployment scripts for more complex deployment requirements.

- **SSH Access**: Provide SSH access to servers for advanced users who require direct server access.

- **Improved Monitoring**: Enhance monitoring capabilities with real-time metrics and alerts for better visibility.

- **Scalability**: Implement a scalable architecture to handle large-scale deployments and increased traffic.

## Members

-   [Manan Gandhi](https://github.com/MananGandhi1810)
-   [Adith Ramakrishna](https://github.com/itsSpirax)
-   [Naitik Lodha](https://github.com/naitiklodha/)
