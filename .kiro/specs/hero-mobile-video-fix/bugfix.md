# Bugfix Requirements Document

## Introduction

The Hero section background video (`hero_video.mp4`, 3.1MB) causes significant performance issues on mobile devices. Mobile browsers frequently block autoplay on large video files, resulting in a blank or broken hero section. Even when the video does load, the 3.1MB download is excessive for mobile connections and degrades the user experience.

The fix is to disable the video entirely on mobile viewports (≤768px) and display the fallback image (`hero-fallback.jpg`, 46KB) instead, providing a fast, reliable mobile experience while preserving the full video experience on desktop.

This aligns with the existing mobile breakpoint defined in Req 11 AC 4 (≤768px) and the fallback image requirement in Req 2 AC 5 / Req 13 AC 9.

> **Bug Tracking:** The QA Engineer should track this bugfix as a new entry in `quality-assurance/bugs.csv` so that test coverage and resolution status can be maintained alongside existing QA findings.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the viewport width is at or below 768px THEN the system attempts to load and autoplay the 3.1MB hero background video, which mobile browsers frequently block or fail to play, resulting in a degraded or blank hero section.

1.2 WHEN a mobile visitor loads the page THEN the system downloads the full 3.1MB video file regardless of viewport size, wasting bandwidth and increasing page load time on mobile connections.

### Expected Behavior (Correct)

2.1 WHEN the viewport width is at or below 768px THEN the system SHALL hide the video element entirely and display the fallback image (`hero-fallback.jpg`) as the hero background, ensuring the section is always visually complete on mobile.

2.2 WHEN the viewport width is at or below 768px THEN the system SHALL prevent the video file from being downloaded, preserving mobile bandwidth and improving page load performance.

2.3 WHEN the viewport width transitions across the 768px threshold (e.g., browser resize or device rotation), THEN the system SHALL dynamically switch between video (above 768px) and fallback image (at or below 768px) without requiring a page reload.

2.4 WHEN the viewport width is at or below 768px, THEN the fallback image SHALL cover the full hero section area (100vh) using cover sizing without distortion, maintaining the same visual composition as the desktop video background.

2.5 The implementation SHALL use a technique that prevents the browser from initiating the video file download on viewports at or below 768px. CSS `display:none` alone is insufficient as browsers may still download the video source.

2.6 WHEN the viewport width is at or below 768px, THEN the hidden video element SHALL NOT be announced by screen readers, and the fallback image SHALL use an empty `alt` attribute (decorative image) consistent with the video's background role.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the viewport width is above 768px THEN the system SHALL CONTINUE TO display the looping, muted, autoplaying MP4 video background with the `playsInline` attribute as specified in Req 2 AC 2.

3.2 WHEN the viewport width is above 768px THEN the system SHALL CONTINUE TO display the navy overlay at rgba(20, 28, 66, 0.55) on top of the video as specified in Req 2 AC 3.

3.3 WHEN the viewport width is above 768px and the video fails to load THEN the system SHALL CONTINUE TO display the poster fallback image (`hero-fallback.jpg`) as specified in Req 2 AC 5 and Req 13 AC 9.

3.4 WHEN the viewport width is at or below 768px THEN the system SHALL CONTINUE TO display the navy overlay at rgba(20, 28, 66, 0.55) on top of the fallback image, maintaining visual consistency with the desktop experience.

3.5 WHEN the viewport width is at or below 768px THEN the system SHALL CONTINUE TO display the heading, subtitle, and CTA buttons with the same mobile-responsive styling as specified in Req 2 AC 6, Req 2 AC 8, and Req 11 AC 4.

3.6 WHEN the viewport width is at or below 768px and the fallback image fails to load, THEN the system SHALL display the navy-dark (#111b42) fallback background colour so the hero section is never blank.
