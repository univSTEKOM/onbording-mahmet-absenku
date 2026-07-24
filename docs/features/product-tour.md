You are a Senior Product Designer and UX Writer.

Design a complete Product Tour (Interactive Guided Tour) for a modern SaaS employee attendance system called **AbsenKu**.

## Objective

Create a first-time onboarding experience that helps new users understand the application naturally without overwhelming them.

The experience should feel premium, modern, friendly, and effortless.

The product tour should educate users while allowing them to immediately start using the application.

Never make the experience feel like reading documentation.

Think like Linear, Notion, Stripe Dashboard, GitHub, Vercel and Google Workspace.

--------------------------------

## Design Language

Use the existing design system.

Framework:
- React
- Tailwind CSS
- shadcn/ui

Use shadcn/ui components wherever appropriate.

Examples:

- Card
- Button
- Tooltip
- Popover
- Dialog
- Badge
- Avatar
- Progress
- Separator
- Scroll Area
- Hover Card
- Alert
- Calendar
- Command
- Dropdown Menu

Use Lucide Icons.

Rounded corners.

Soft shadows.

Smooth animations.

Blue as the primary brand color.

The Product Tour UI must feel like a native part of the application.

Avoid default-looking walkthroughs.

--------------------------------

## Tour Behavior

Create a Spotlight Product Tour.

When each step begins:

- Darken the background using a semi-transparent overlay.
- Highlight only the focused component.
- Smoothly animate the spotlight transition.
- Automatically scroll if the target component is outside the viewport.
- Animate tooltip appearance with a subtle fade and slide.

Do NOT abruptly jump between elements.

The transition should feel smooth and polished.

--------------------------------

## Tour Card

Every tooltip should contain:

Small icon

Title

Friendly explanation

Progress indicator

Example:

Step 2 of 8

Buttons:

Previous

Next

Skip Tour

Finish (last step)

Use a clean Card design.

Maximum width around 360px.

Readable typography.

Comfortable spacing.

--------------------------------

## Tone of Voice

Use conversational language.

Professional but friendly.

Avoid robotic explanations.

Avoid technical terminology.

Each explanation should be short.

Maximum 2–3 sentences.

Encourage exploration.

Examples:

✅ Great

"Here you'll find a quick overview of your attendance today. Everything important is summarized in one place."

Instead of

❌

"This dashboard contains information regarding attendance."

--------------------------------

## Product Tour Flow

### Step 1

Welcome

Display a beautiful welcome dialog.

Illustration.

Message:

Welcome to AbsenKu 👋

We'll show you around in less than one minute so you can get started quickly.

Buttons:

Start Tour

Skip

--------------------------------

### Step 2

Sidebar Navigation

Highlight sidebar.

Explain:

This is your main navigation.

Use it to access attendance, history, leave requests and your profile anytime.

--------------------------------

### Step 3

Dashboard Summary

Highlight summary cards.

Explain:

This section gives you a quick overview of today's attendance, working hours and remaining leave.

No need to search around.

--------------------------------

### Step 4

Attendance Button

Highlight Check In.

Explain:

This is where you'll record your attendance.

You'll also complete face verification before checking in.

--------------------------------

### Step 5

Attendance History

Highlight History menu.

Explain:

Need to review previous attendance?

Everything is organized here with filters and search.

--------------------------------

### Step 6

Leave Requests

Highlight Leave menu.

Explain:

Going on leave or feeling unwell?

Submit your request here and track its approval status.

--------------------------------

### Step 7

Profile

Highlight user profile.

Explain:

Keep your personal information up to date.

You can also register or update your face verification here.

--------------------------------

### Step 8

Finish

Celebrate completion.

Illustration.

Message:

🎉 You're all set!

Enjoy using AbsenKu and have a productive day.

Button:

Go to Dashboard

--------------------------------

## Interaction

Allow users to:

Skip anytime

Go back

Continue later

Close using ESC

Close by clicking Skip

Never force users to finish.

Remember completion using Local Storage.

Do not show the tour again unless manually restarted.

--------------------------------

## Accessibility

Keyboard navigation.

Screen reader friendly.

Visible focus state.

Large click targets.

High contrast.

Responsive.

--------------------------------

## Motion

Use subtle animations.

150–250ms transitions.

Fade

Scale

Slide

Smooth spotlight movement.

No distracting animations.

--------------------------------

## UX Principles

Keep users focused on one feature at a time.

Avoid information overload.

Never explain everything.

Explain only what users need at that moment.

Guide users toward completing their first successful attendance.

The experience should feel welcoming, elegant, intuitive, and memorable.

The final result should resemble the onboarding experience of a premium SaaS product released in 2026.
