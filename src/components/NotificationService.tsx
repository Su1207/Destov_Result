export async function sendNotificationToTopic(
  title: string,
  topic: string,
  body: string,
  key: string
) {
  const message = {
    to: `/topics/${topic}`,
    notification: {
      title: title,
      body: body,
    },
  };

  await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${key}`,

      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
