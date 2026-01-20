# Write better prompts for Gemini for Google Cloud

This document describes how to optimize the prompts that you send to Gemini for Google Cloud and the type of assistance it provides so that you can be more productive using Google Cloud products and services.

You can prompt Gemini for Google Cloud in different ways depending on which Google Cloud product you're using. For some products, you prompt Gemini for Google Cloud in a conversational interface, while in others you prompt in code or query editors. For instructions on how to enter prompts, see the documentation for your product.

For more information about Gemini for Google Cloud, an AI-powered collaborator in Google Cloud, see Gemini for Google Cloud overview.

## Provide context and details in your prompts

The questions that you ask Gemini for Google Cloud, including any input information or code you want Gemini to analyze or complete, are called prompts. The answers or code completions that you receive from Gemini are called responses.

When you ask Gemini for Google Cloud for help, you should include as much context and specific detail as possible. Because AI-generated responses are based on a vast range of possibilities, it's important for you to be precise. For the best results, your prompts shouldn't exceed 4,000 characters.

## Here are some ways to provide helpful context and detail in your prompts:

- Write your prompt like you're talking with a person. Don't enter only keywords as you might when searching for a document online, but include the kind of detail you'd include when explaining a problem to someone. For example, instead of entering the terms "workload GKE," ask a complete question: "What kinds of workloads does GKE support?"

- Describe why you're trying to accomplish a task. Details about what you're trying to accomplish can help Gemini for Google Cloud provide a more useful answer. For example, telling Gemini for Google Cloud that you want to "set up a simple, secure Google Cloud site for hosting a blog" has more helpful details than only asking "how to deploy a website." Because there are often multiple correct ways to accomplish a technical goal, providing Gemini for Google Cloud sufficient context can help ensure a good response.

- Ask to include all the parameters in a command. For example, when you ask Gemini Code Assist to generate code functions, you are likely to produce a more useful and detailed response by telling it to "make sure all methods use their required arguments."

- Include your level of expertise. It's especially helpful to match your prompt request with your expertise level when you ask for a suggestion. Asking Gemini for Google Cloud to explain a concept or code as if you're an expert programmer–or a novice programmer–can give you different, and more appropriate, results.

For example, to direct Gemini to respond from an expert context, you could prompt it with "create Python code to list all Compute Engine instances. You are an expert software developer using Google Cloud." Similarly, you could ask Gemini for Google Cloud to "explain Kubernetes and its benefits to me in the simplest terms possible."

- Include details about products and technologies. If you're looking for answers about a specific product, technology, or technical capability, include that in your prompt. Similarly, specifying a programming language can help you get more relevant responses. If you're unsure about what technologies or products to consider, ask Gemini to compare different options for you.

- Break complex problems into multiple requests. Writing separate prompts can help Gemini refine and focus the answers that it gives, helping you move progressively toward a solution.

## What types of assistance can Gemini give you?

While there are many ways to use the language and code capabilities in Gemini for Google Cloud, the following sections describe some key areas where Gemini assistance can be most useful.

Remember that Gemini for Google Cloud can produce unexpected, incomplete, or erroneous results when you ask for assistance. For more information, see Gemini for Google Cloud and responsible AI.

## Information and reference prompts

You can ask Gemini for Google Cloud for information about Google Cloud products and services, general technologies, definitions, and how those concepts and technologies relate to one another. For example, you can ask the following:

- "What does "serverless architecture" mean in Google Cloud?"
- "What Google Cloud products provide managed Kubernetes cluster support?"
- "What are the key technical features of BigQuery?"
- "When should I use Compute Engine instead of App Engine?"
- "What kinds of model testing does Vertex AI support?"
- "What vulnerability scanning does Google's Security Command Center offer?"

## Analytical and operational prompts

You can ask Gemini for Google Cloud to summarize and simplify code functions, and give operational suggestions—for example:

"Simplify the code I've selected" (for example, after selecting Python code in an IDE).
"Summarize what this function does" (for example, after selecting a C code function in an IDE).
"How do I optimize IAM permissions?"

## Task prompts

You can ask Gemini for Google Cloud to help you accomplish a specific task or set of tasks. For complex tasks, try breaking your prompts into separate steps. For example, you can get procedures and task information with questions like the following:

- "How do I set up a Google Cloud account?"
- "How do I make a bucket public?"
- "How can I pull messages from a Pub/Sub subscription?"
- "How do I use Vertex AI to deploy a model?"

## Generative prompts

Gemini for Google Cloud can generate and complete code structures as you enter a request from an IDE or from the Google Cloud console. Gemini for Google Cloud can also help you generate process documentation for code design and development.

For example, you can ask Gemini for Google Cloud to help you do the following:

- "Create a function with specific variables in C."
- "Create a high-level plan for designing and building and deploying a web app in Google Cloud."
- "Create a bare metal kubernetes cluster YAML file with default IP addresses."
- "Create javascript code for a drop-down menu."
- "Create a brief, easy-to-understand user story about a data scientist named Kim designing a Vertex AI model."
- "Create a gcloud command to give the developer Google group access to view my Google Cloud project."

## Application-related prompts

If you set up Gemini Cloud Assist for a folder and are using the Cloud Assist panel at the folder level in the Google Cloud console, then assistance and responses are limited to applications related to the folder for products that support applications. The following list includes Google Cloud products supported at the folder level:

- Application Design Center
- App Hub
- Cloud Asset Inventory
- Cloud Hub
- Cloud Monitoring
- Logs Explorer

Only prompts related to applications are supported in these Google Cloud products if you are scoped to a folder in the Google Cloud console. If you submit a question that doesn't relate to applications within this scope, then Gemini Cloud Assist provides a generic response stating that folders are intended for application-related prompts. The following list shows example application-related prompts:

- "How many applications are in production?"
- "Help troubleshoot application example-application."
  To get specific assistance on other products and resources, use project picker at the top of the Google Cloud console page to select a project resource.

Additionally, you must enable application management on the folder to use the Cloud Assist panel at the folder level.

## What's next

- For more about large language model (LLM) prompt design, see [Introduction to prompt design](https://docs.cloud.google.com/vertex-ai/docs/generative-ai/learn/introduction-prompt-design).
- To learn more about generative AI, see [Generative AI learning path](https://www.cloudskillsboost.google/journeys/118).
- For more on Gemini and LLM models, see [Gemini for Google Cloud and responsible AI](https://docs.cloud.google.com/gemini/docs/discover/responsible-ai).
- For more on how we only use your feedback data with your permission, see [How Gemini for Google Cloud uses your data](https://docs.cloud.google.com/gemini/docs/discover/data-governance).
