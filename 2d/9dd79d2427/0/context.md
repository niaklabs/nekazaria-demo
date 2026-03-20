# Session Context

## User Prompts

### Prompt 1

Implement the following plan:

# Plan: Wire up Campañas Sanitarias index screen

## Context
The app has a campaign detail page (`/normativa/campanas/{id}`) but no **listing page** for all campaigns. The Pencil design (UMN9b) shows a screen that lists all campaigns with progress + a section for immobilized animals grouped by species/restriction type. This screen needs a link from the Normativa page.

## Changes

### 1. Migration: add `species` to `sanitary_campaigns` + `restriction_type` to `cam...

