import { isLoggedIn, ofRandom } from "../Util"

const createCommentSubAgent = (end) => {

    let stage;
    let comment;
    let conf;
    const CS571_WITAI_ACCESS_TOKEN = "JIHS27XMGB5OURTUQTD5CFN446YINVWL";

    const handleInitialize = async (promptData) => {
        if (await isLoggedIn()) {
            stage = "FOLLOWUP_COMMENT";
            return "What is the comment you would like to create?";           
        } else {
            return end("You must be logged in to make a comment.")
        }
        
    }

    const handleReceive = async (prompt) => {
        switch(stage) {
            case "FOLLOWUP_COMMENT": return await handleFollowupComment(prompt);
            case "FOLLOWUP_CONFIRM": return await handleFollowupConfirm(prompt);
        }
    }

    const handleFollowupComment = async (prompt) => {
        comment = prompt;
        stage = "FOLLOWUP_CONFIRM";
        return "Are you sure you want to post this?";
    }

    const handleFollowupConfirm = async (prompt) => {
        conf = prompt;
        stage = undefined;
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if(data.intents.length > 0 && data.intents[0].name === 'wit$confirmation') {
            await fetch("https://cs571api.cs.wisc.edu/rest/f24/ice/comments", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CS571-ID": CS571.getBadgerId(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comment: comment
                })
            })
            return end(ofRandom([
                "Your comment has been posted!",
                "Congrats, your comment has been posted!"
            ]));
        } else {
            return end(ofRandom([
                "No worries, if you want to create a comment in the future, just ask!",
                "That's alright, I didn't want to post your comment anyway."
            ]))
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createCommentSubAgent;