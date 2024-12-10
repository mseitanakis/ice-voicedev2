import { isLoggedIn, ofRandom } from "../Util"

const createLoginSubAgent = (end) => {

    let stage;
    let username;
    let password;

    const handleInitialize = async (promptData) => {
        stage = "FOLLOWUP_USERNAME";
        return "Great, what's your username?";
    }

    const handleReceive = async (prompt) => {
        switch (stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
        }
    }

    const handleFollowupUsername = async (prompt) => {
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        return "Great, what's your password?";
    }

    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        stage = undefined;

        // TODO Log the user in. If successful, notify yes! otherwise incorrect credentials
        const res = await fetch("https://cs571api.cs.wisc.edu/rest/f24/ice/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        if (res.status === 200) {
            return end("Congrats, you are logged in!");
        } else {
            return end("Uh oh, check your credentials");
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;