#!/bin/bash
cd /Volumes/Papu\ Ext/Dev/QuantumHolistic/project/quantum-holistic
node scripts/kimiko-pipeline.mjs >> logs/kimiko-plants.log 2>&1
node scripts/kimiko-blog-pipeline.mjs 10 >> logs/kimiko-blog.log 2>&1
