#!/usr/bin/env bash

# Setup python environment for Quarto
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q jupyter pyyaml numpy matplotlib pandas tabulate ipython

# Build the Quarto research document
quarto render research/arteta_ball_post.qmd

# Ensure the public research directory exists
mkdir -p public/research

# Copy the generated HTML and dependencies to the public folder
cp research/arteta_ball_post.html public/research/
if [ -d "research/arteta_ball_post_files" ]; then
    cp -r research/arteta_ball_post_files public/research/
fi

echo "✅ Research post built and copied to public/research/"

