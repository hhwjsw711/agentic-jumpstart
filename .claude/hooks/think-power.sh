#!/bin/bash

# Read the JSON input from stdin
input=$(cat)

# Extract the original user prompt from the JSON
# Assuming the JSON structure has a field containing the original prompt
original_prompt=$(echo "$input" | jq -r '.originalPrompt // .prompt // .text // .input // ""' 2>/dev/null)

# Check if the original prompt contains the "-h" token
if [[ "$original_prompt" == *"-h"* ]]; then
    # Inject "think hard" into the prompt
    modified_prompt="$original_prompt think hard"

    # Update the JSON with the modified prompt
    # Try to update the most likely field names
    output=$(echo "$input" | jq --arg new_prompt "$modified_prompt" '
        if has("originalPrompt") then .originalPrompt = $new_prompt
        elif has("prompt") then .prompt = $new_prompt
        elif has("text") then .text = $new_prompt
        elif has("input") then .input = $new_prompt
        else . + {"prompt": $new_prompt}
        end
    ' 2>/dev/null)
    
    # Output the modified JSON
    echo "$output"
    exit 0
else
    # No modification needed, pass through the original input
    echo "$input"
    exit 0
fi

