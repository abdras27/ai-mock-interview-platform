# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Interview Evaluation Setup

Interview evaluation uses `POST /api/evaluate`.

- If `TRAINED_MODEL_API_URL` is set, requests are forwarded to your trained model endpoint.
- If `TRAINED_MODEL_API_URL` is not set, the app uses a built-in local fallback evaluator so you can run without external infrastructure.

Set these environment variables only when using your trained model service:

- `TRAINED_MODEL_API_URL`: Full URL of your model inference endpoint.
- `TRAINED_MODEL_API_KEY` (optional): Bearer token sent as `Authorization` header.

Expected request payload:

```json
{
  "interview": [
    {
      "question": "string",
      "transcript": "string",
      "videoFrames": ["data:image/jpeg;base64,..."]
    }
  ]
}
```

## Authentication and User-Wise Cloud History

The app supports Google sign-in via Firebase Authentication and stores history per user in Firestore.

Add these values to `.env.local` to enable auth + user-wise cloud persistence:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

If these are missing, authentication and Firestore history are disabled.

Open `/login` and sign in to access Firestore-backed history.

Expected response payload:

```json
{
  "knowledge": { "score": 0, "improvementTip": "string" },
  "logicalReasoning": { "score": 0, "improvementTip": "string" },
  "communicationClarity": { "score": 0, "improvementTip": "string" },
  "confidence": { "score": 0, "improvementTip": "string" },
  "timeManagement": { "score": 0, "improvementTip": "string" },
  "facialPresence": { "score": 0, "improvementTip": "string" },
  "overallFeedback": "string"
}
```
