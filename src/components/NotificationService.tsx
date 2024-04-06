export async function sendNotificationToTopic(
  title: string,
  body: string,
  key: string
) {
  const message = {
    to: `/topics/Users`,
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
