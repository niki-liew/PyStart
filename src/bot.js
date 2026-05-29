const API_KEY = "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";

const MODEL =
    "llama-3.3-70b-versatile";



let memorySummary =
    localStorage.getItem("memorySummary")
    || "";

let recentMessages =
    JSON.parse(
        localStorage.getItem("recentMessages")
    ) || [];



function saveMemory() {

    localStorage.setItem(
        "memorySummary",
        memorySummary
    );

    localStorage.setItem(
        "recentMessages",
        JSON.stringify(recentMessages)
    );
}



async function sendMessage(userMessage) {

    // save user message
    recentMessages.push({
        role: "user",
        content: userMessage
    });



    // build message list
    const messages = [

        {
            role: "system",

            content:
`
You are a coding assistant chatbot.

Your job is to:
- review python code
- debug errors
- explain programming concepts
- help improve bad code
- suggest fixes and improvements

Be concise and helpful.

Conversation memory:
${memorySummary}
`
        },

        ...recentMessages
    ];



    // send request
    const response =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${API_KEY}`
                },

                body: JSON.stringify({

                    model: MODEL,

                    messages: messages
                })
            }
        );



    const data =
        await response.json();

    const reply =
        data.choices[0]
        .message.content;



    // save assistant reply
    recentMessages.push({
        role: "assistant",
        content: reply
    });



    // summarise old memory occasionally
    if (recentMessages.length > 10) {

        await summariseMemory();
    }



    saveMemory();

    return reply;
}



async function summariseMemory() {

    const oldMessages =
        recentMessages.slice(
            0,
            recentMessages.length - 4
        );



    const conversationText =
        oldMessages.map(
            m =>
                `${m.role}: ${m.content}`
        ).join("\n");



    const response =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${API_KEY}`
                },

                body: JSON.stringify({

                    model: MODEL,

                    messages: [

                        {
                            role: "system",

                            content:
`
You summarise conversations.

Keep:
- user coding skill level
- projects
- preferences
- important context

Be concise.
`
                        },

                        {
                            role: "user",

                            content:
conversationText
                        }
                    ]
                })
            }
        );



    const data =
        await response.json();



    memorySummary =
        data.choices[0]
        .message.content;



    // keep newest messages
    recentMessages =
        recentMessages.slice(-4);



    saveMemory();
}