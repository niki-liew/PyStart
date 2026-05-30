const API_KEY = window.API_KEY

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



async function sendMessage(message) {

    const res = await fetch("https://niki-is-the-king.doctorindustries.workers.dev/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    const data = await res.json();

    console.log("RAW WORKER RESPONSE:", data);

    return data.choices[0].message.content;
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