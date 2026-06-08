FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# EAS CLI
RUN npm install -g eas-cli

# Android SDK command-line tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdline.zip \
    && unzip -q /tmp/cmdline.zip -d ${ANDROID_HOME}/cmdline-tools \
    && rm /tmp/cmdline.zip \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest

ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/emulator:${PATH}"

# Accept licenses and install SDK packages
RUN yes | sdkmanager --licenses > /dev/null 2>&1 \
    && sdkmanager --install \
        "platform-tools" \
        "platforms;android-35" \
        "build-tools;35.0.0" \
        "ndk;27.1.12297006" \
        "cmake;3.22.1" \
    && rm -rf ${ANDROID_HOME}/.temp

WORKDIR /app
CMD ["bash"]
