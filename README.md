<div align="center">
  <img width="400" height="400" alt="form canvas logo" src="/formCanvasLogo.png" />
</div>


# FormCanvas

FormCanvas is a production-grade Enterprise Form Engine Builder designed for building dynamic, schema-driven forms with conditional logic and runtime validation.

This is not a simple form builder. It is a form generation engine that allows users to design forms visually, define validation rules programmatically, attach conditional logic, persist schemas, and render fully dynamic forms from structured configurations.

The project is built to demonstrate strong frontend architecture, scalable state orchestration, and real-world SaaS design patterns using modern React practices.

---

## Live Demo

Live Link:  


---

## Overview

FormCanvas allows users to:

- Drag and drop form fields into a canvas
- Reorder and remove fields
- Configure field properties dynamically
- Define validation rules using a rule builder
- Attach conditional logic such as:
  - Show field if age > 18
  - Hide field if checkbox is false
  - Disable field based on another field’s value
- Persist form schemas
- Render forms dynamically from saved schema
- Switch between Builder Mode and Preview Mode

The entire UI is schema-driven. No field is hardcoded in the renderer.

---

## Core Architecture Philosophy

The system is designed around a single principle:

The schema is the source of truth.

Everything is derived from structured JSON:

- UI rendering
- Validation rules
- Conditional logic
- Field configuration
- Persistence

This ensures:

- High flexibility
- Scalability
- Extensibility
- Clear separation of concerns
- Enterprise maintainability

The architecture avoids over-engineering while maintaining production-grade clarity.

---

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Styled Components
- Zustand
- Zod
- Lucide React

The stack was intentionally kept minimal and industry-standard. No unnecessary libraries. No excessive abstractions.

---

## Key Features

### 1. Drag and Drop Form Builder

- Field palette for common field types
- Visual canvas for form construction
- Field reordering
- Field removal
- Active field selection for configuration

The builder is intuitive and optimized for desktop, tablet, and mobile.

---

### 2. Schema-Driven Rendering

Every form is represented as a JSON schema:

- Field type
- Label
- Placeholder
- Validation configuration
- Conditional rules
- Select options
- Required flags

The renderer dynamically maps schema definitions to UI components. No duplication of logic.

---

### 3. Dynamic Validation Engine

Validation rules are defined in the builder UI and converted into a dynamic Zod schema at runtime.

Supported validation:

- Required fields
- Minimum and maximum length
- Regex patterns
- Email format
- Numeric ranges

The validation schema is generated programmatically from field configuration, ensuring flexibility and correctness.

---

### 4. Conditional Logic Engine

A lightweight rule evaluator enables dynamic field behavior.

Supported logic patterns:

- Equals
- Not equals
- Greater than
- Less than
- Boolean evaluation

Actions:

- Show
- Hide
- Disable

Rules are evaluated against current form state and recalculated on change. The logic engine is intentionally simple and readable, avoiding unnecessary complexity.

---

### 5. State Management with Zustand

Zustand is used to manage:

- Form schema
- Selected field
- Builder state
- Preview mode
- Persistence layer

The store is structured in clean slices to prevent deeply nested state and to maintain clarity. Selectors are used to prevent unnecessary re-renders.

---

### 6. Builder and Preview Modes

FormCanvas provides two operational modes:

Builder Mode  
Design, configure, and structure forms.

Preview Mode  
Render the form exactly as an end user would see it, with validation and conditional logic active.

This separation reflects real-world SaaS form platforms.

---

### 7. Persistence Layer

Schemas can be:

- Saved to local storage
- Loaded from storage
- Reset

The architecture allows easy extension to a remote API without restructuring core logic.

---

## Design System

The UI follows a clean red and neutral theme:

- Red as primary accent
- Soft white and warm gray as background
- No gradients
- High readability
- Clean spacing system
- Custom dropdown components
- Accessible input components

The interface is professional and enterprise-ready.

---

## Responsive Design

The application is fully responsive and mobile-first.

- Sidebar collapses on smaller screens
- Canvas adapts to viewport width
- Configuration panel stacks vertically on mobile
- Drag interactions remain usable on tablet devices

Media queries are implemented cleanly without layout hacks.

---

## Folder Structure

The project follows a feature-based architecture:

- components
- features
- store
- hooks
- utils
- types
- styles

Business logic is separated from presentation components.  
Schema logic is separated from UI rendering.  
Validation logic is isolated and testable.

---

## What This Project Demonstrates

This project showcases:

- Schema-driven UI architecture
- Dynamic component rendering
- Runtime validation generation
- Conditional logic evaluation
- Complex state orchestration
- Scalable React folder structure
- Production-level UI discipline
- Clean TypeScript modeling

It reflects how an internal SaaS form engine would be built in a real company environment.

---

## Why This Matters

Form builders appear simple on the surface, but they require:

- Careful state modeling
- Deterministic schema control
- Runtime validation generation
- Conditional dependency resolution
- Performance awareness
- Clean separation of UI and logic

FormCanvas is built to demonstrate those skills clearly and professionally.

---

## License

This project is intended for educational and portfolio demonstration purposes.