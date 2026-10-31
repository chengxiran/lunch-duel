# Process

## Starting idea

I often spend too long at lunchtime because several options all seem acceptable. My original idea was a recommendation tool, but a meaningful recommendation system would need live location, restaurant, and price data. That would make the project much larger and move the focus away from interaction design.

I reduced the question to this: can a sequence of quick comparisons become a small night-market game that helps a person notice their own preference? The target user has two to eight options and wants to decide in about one minute. The central loop is: enter options → choose between two food cards → receive immediate feedback and the next challenger → get a final result and decide whether to play again.

## Design and code changes

The first version only showed two foods and a final result. I expanded it into three stages: a check-in, the stall showdown, and a printed-style checkout receipt. The check-in asks for hunger, time, and mood; the showdown adds chapter labels, progress, and market-call text; the result shows a locked-order receipt. These additions make the game’s progression visible rather than making it feel like an isolated button click.

I also added the Market Intelligence Desk and local locked-order history. The recommendation feature uses only built-in menu data categorised by budget and craving, so it is reliable without an external service and does not pretend to show real-time restaurant information. History remains only in the current browser and can be cleared. A once-per-game coin flip gives users a bounded, explicit way to resolve a tie.

Two ordinary errors are handled: the game will not start with fewer than two unique options, and it asks the user to reduce a shortlist longer than eight options.

## User trial

I asked one classmate to use the game without explaining the interface first. She entered several lunch options and explored the opening screen before starting a showdown.

She was unsure whether the Market Intelligence Desk was a required step or an optional feature. She also liked the visual style of the final receipt, but said that the options to restart with the same list or use a new shortlist should be more prominent.

Based on this feedback, I changed the Market Intelligence Desk label to “Optional Bonus Mode” and added explicit text explaining that it can be skipped when the user already has a shortlist. I also changed the “Use a new shortlist” control on the final screen from a small text link to a full button matching the replay button. These changes make both the start of the game and the next action after a result easier to understand.

## AI tools

I used OpenAI Codex to help draft the initial structure, identify error cases such as empty input, repeated options, and too many options, and check that the documentation met the assignment requirements.

I kept the suggestion to use a single elimination loop because it clearly connects user action, program response, and feedback. I changed the suggestion of automatic random food selection: a random winner would not reflect the user’s choice, so each round is decided by the user. All generated material was reviewed, tested, and edited by the author.
