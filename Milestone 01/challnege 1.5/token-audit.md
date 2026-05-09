# Token Audit Report

## Pre-Fix Audit

- Tokenizer method: OpenAI-compatible `gpt-4o` tokenization (`js-tiktoken`, matching the OpenAI tokenizer rules)
- System prompt token count: `390`
- Sample user message token count: `241`
- API response token count: blocked in this environment because no `OPENROUTER_API_KEY` was available to run a live review request.
- Monthly call volume assumption: `200 users x 15 calls/day x 30 days = 90,000 calls/month`

Prompt-side monthly cost before rewrite:

`390 prompt tokens x $0.0000025/token = $0.000975 per call`

`$0.000975 x 90,000 calls = $87.75/month`

Prompt-side monthly cost after rewrite:

`124 prompt tokens x $0.0000025/token = $0.00031 per call`

`$0.00031 x 90,000 calls = $27.90/month`

Prompt-side monthly savings:

`$87.75 - $27.90 = $59.85/month`

## Waste Sources

### 1. Over-Verbose Role Framing

Quoted prompt text:

> "Greetings! I am your helpful and dedicated AI assistant, specifically designed to assist developers and engineers with their programming tasks."

Why it wastes tokens:

This spends tokens on a greeting and general helpfulness instead of the operative role. The model only needs the role and task constraints, so this wording adds cost on every request without changing behavior.

### 2. Repeated Scope Restrictions

Quoted prompt text:

> "you must only respond to code review requests"
>
> "your outputs must be focused entirely on code review"
>
> "please ensure that you stay on the topic of code review only"

Why it wastes tokens:

The same restriction is repeated three times with almost identical meaning. Once the rule is stated clearly, repeating it increases every prompt bill without adding a new instruction.

### 3. Bloated Formatting Instructions

Quoted prompt text:

> "Each of these areas should be written in clear, complete sentences that provide enough context for the student to understand the underlying logic..."

Why it wastes tokens:

The formatting requirement is valid, but it is padded with filler around readability, context, transitions, and headings. The same output contract can be expressed in a much smaller block.

## Rewritten Prompt

- Original token count: `390`
- New token count: `124`
- Reduction: `266 tokens`
- Percentage reduction: `266 / 390 x 100 = 68.21%`

Full rewritten prompt:

```text
You are a senior engineer and professional code reviewer assisting developers and engineers with programming tasks.

Respond only to code review requests. Do not answer questions unrelated to code review or code analysis.

Audit the provided code to identify critical bugs, potential security vulnerabilities, and meaningful improvement suggestions. Keep the review constructive and professional so the student learns from the feedback.

Format the response with these headings, in this order:
Issues Found
Suggested Improvements
Overall Assessment

Write in clear, complete sentences with enough context to explain your reasoning. Keep formatting consistent and readable, stay entirely on code review, and limit the full response to 300 words.
```

Instruction preservation mapping:

| Original Instruction | Location in Rewrite |
| --- | --- |
| Assist developers and engineers with programming tasks | Sentence 1 |
| Only answer code review requests | Sentence 2 |
| Refuse unrelated questions | Sentence 2 |
| Act as a senior engineer / professional reviewer | Sentence 1 |
| Identify critical bugs | Sentence 3 |
| Identify security vulnerabilities | Sentence 3 |
| Suggest meaningful improvements | Sentence 3 |
| Keep tone constructive and professional | Sentence 3 |
| Help the student learn | Sentence 3 |
| Use headings `Issues Found`, `Suggested Improvements`, `Overall Assessment` | Heading block |
| Use clear, complete sentences | Final sentence |
| Give enough context for reasoning | Final sentence |
| Keep formatting consistent and readable | Final sentence |
| Stay entirely on code review | Final sentence |
| Limit output to 300 words | Final sentence |

## Cost Comparison Table

The table below uses real tokenizer counts for prompt text. Completion-side values require a live API run, which was blocked here by the missing API key.

| Version | Prompt Tokens | Completion Tokens | Cost Per Call | Monthly Cost |
| --- | ---: | ---: | ---: | ---: |
| Original | 390 | Pending live API run | `390 x 0.0000025 = $0.000975` | `$0.000975 x 90,000 = $87.75` |
| After Rewrite | 124 | Pending live API run | `124 x 0.0000025 = $0.00031` | `$0.00031 x 90,000 = $27.90` |

## Token Logging

Added usage logging in `src/callAI.js` for:

- `prompt_tokens`
- `completion_tokens`
- `total_tokens`
- `est_cost_usd`

Expected runtime log format:

```text
[TOKEN LOG] prompt_tokens: 210 | completion_tokens: 140 | total: 350 | est_cost_usd: $0.0019
```
