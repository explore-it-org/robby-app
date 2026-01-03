# Feature Specification: Home Screen

## Overview

The Home Screen is the main navigation container and primary interface of the explore-it Robotics app. It provides a tabbed UI hosting two essential sections: Robot Selection and Program Library. This serves as the central hub from which users manage robot connections and access their saved programs before entering programming modes.

## Goals

- Provide unified access to robot connection and program management
- Clear separation between device management and program management concerns
- Enable quick switching between robot selection and program library
- Minimize navigation depth - keep critical functions at top level
- Support workflow: connect robot → select/create program → program robot

## Tab Structure

```txt
┌─────────────────────────────────────┐
│    explore-it Robotics              │ ← App Bar
├─────────────────────────────────────┤
│                                     │
│  [Robot Tab Content]                │
│                 OR                  │
│  [Programs Tab Content]             │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│   [Robot]  [Programs]               │ ← Bottom Tab Bar
└─────────────────────────────────────┘
```
