# Chrome extension API

## Introduction

This is a backend API for a screen recording chrome extension that enables audio transcription. 

baseURL = [https://puce-better-haddock.cyclic.cloud](https://puce-better-haddock.cyclic.cloud)

<br>
## Run Locally
Clone the project

```bash
  git https://github.com/IpieA/chrome-extension-BE.git
```

Go to the project directory

```bash
  cd chrome-extension-BE
```

Install dependencies

```bash
npm install
```

Start the dev server

```bash
npm run dev
```

| Endpoint | Method | Description |
| ------  | ------- | ------- |
| /api/recordings/start | POST | Start a new recording session and create a unique id for session |
| /api/recordings/send-chunk/id | POST  | Send video chunks as part of the recording session for a specified id. |
| /api/recordings/stop/id | POST | Stop the recording session for a specified ID, merge chunks and run transcription |
| /api/recordings/id | GET | Retrieve information (transcription and merged video) using specified id |