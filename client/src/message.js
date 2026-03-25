function Message({ message }) {
  return (
    <div className={`message ${message.me ? "me" : "other"}`}>
      {message.text}
      <div className="time">01:07</div>
    </div>
  );
}

export default Message;
