import axios from "axios";

const ghRepoRegex =
    /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/;

const getAccessToken = async (code) => {
    return await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GH_CLIENT_ID}&client_secret=${process.env.GH_CLIENT_SECRET}&code=${code}`,
        {},
        {
            headers: {
                accept: "application/json",
            },
            validateStatus: false,
        },
    );
};

const getUserDetails = async (token) => {
    return await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: "Bearer " + token,
            "X-OAuth-Scopes": "repo, user",
            "X-Accepted-OAuth-Scopes": "user",
        },
        validateStatus: false,
    });
};

const getUserEmails = async (token) => {
    return await axios.get("https://api.github.com/user/emails", {
        headers: {
            Authorization: "Bearer " + token,
            "X-OAuth-Scopes": "repo, user",
            "X-Accepted-OAuth-Scopes": "user",
        },
        validateStatus: false,
    });
};

const createWebhook = async (token, githubUrl) => {
    const match = githubUrl.match(ghRepoRegex);
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;
    return await axios.post(
        `https://api.github.com/repos/${match.groups.owner}/${match.groups.name}/hooks`,
        {
            name: "web",
            active: true,
            events: ["push"],
            config: {
                url: "<WebHook URL>",
                content_type: "json",
                insecure_ssl: "0",
            },
        },
        {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: "Bearer " + token,
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
            },
            validateStatus: false,
        },
    );
};

export { getAccessToken, getUserDetails, getUserEmails, createWebhook };
