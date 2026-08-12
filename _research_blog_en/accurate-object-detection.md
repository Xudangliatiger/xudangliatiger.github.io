---
layout: research_blog
title: "Improving Classification for More Accurate Object Detection"
date: 2021-01-20 16:00:00
author: "Dongli Xu"
lang: en
content_type: blog
topic: "Object Detection"
summary: "A high-level look at the mismatch between classification confidence and localization quality, why it breaks NMS, and how ranking objectives might address it."
alternate_url: /2021/01/20/Accurate-object-detection/
og_image: /img/research/research-social-card-en.png
tags:
  - Computer Vision
  - Object Detection
---

It had been two years since I last wrote a blog post. While running experiments, I wanted to step back and summarize both the progress of object detection and the direction of my own work.

## What does “accurate object detection” mean?

The phrase usually suggests improving bounding-box localization. But accurate detection is not only a localization problem. A detector also has a classification branch, and the final result combines its category confidence with the box predicted by the localization branch.

The central failure is that the two branches can disagree. A well-localized box may receive a low classification score, while a poorly localized box may receive a high one. This mismatch directly affects non-maximum suppression.

NMS makes dense detection practical by selecting one box from a cluster of overlapping candidates. It is not, however, a self-contained spatial clustering method. It relies on an external score to rank and remove candidates. In most detectors, that score is the classification confidence.

In one sentence: **NMS expects the classification score to indicate the quality of the localized box.** When classification and localization disagree, NMS can preserve the wrong candidate.

## Estimating the upper bound

Before designing a solution, we can estimate how much this mismatch matters. Start with a trained detector—FCOS with PAA and focal loss in our experiment. During evaluation, use the ground-truth boxes to compute the IoU of each prediction, then reorder the existing classification scores according to localization quality.

This intervention removes ranking mistakes caused by the mismatch while preserving the original score distribution. It acts like a transport of scores: only their assignment to boxes changes.

As more boxes are corrected, AP increases from 40.5 to 70.0—roughly a 75% relative improvement. The experiment is not a deployable method because it uses ground truth at test time. Its purpose is diagnostic: the classification–localization mismatch leaves a very large performance gap.

## Possible solution families

### 0. Add a quality branch

Examples include the IoU branch introduced around ECCV 2018 and the centerness branch in FCOS. An additional prediction estimates localization quality and helps NMS rank candidates.

### 1. Association loss

If the problem comes from the two branches not communicating, one direct approach is to add an L2 objective that aligns their outputs. In the FCOS setting discussed here, this improves AP by 2.8, although it still underperforms a centerness branch.

### 1+. Integrate localization into classification

Warpage Loss, Quality Focal Loss, and Varifocal Loss do not train two scores independently. They inject localization information into the classification objective. This passes localization quality into classification, but does not symmetrically use classification confidence to refine localization.

### 2. Pairwise ranking

AP Loss and Fast AP Loss can be understood through learning to rank. Association-style losses resemble pointwise ranking; pairwise AP objectives instead train the relative ordering of candidates. From this view, classification for detection is partly a ranking task.

### 3. Listwise ranking

A natural next step is to optimize the candidate list as a whole. At the time of this note, listwise ranking remained largely unexplored in this setting.

The broader lesson is methodological: improving a subsystem metric is not enough when the downstream algorithm consumes the relationship between two predictions. The ranking contract between classification, localization, and NMS is the real object that needs to be optimized.
