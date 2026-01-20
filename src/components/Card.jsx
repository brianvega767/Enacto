function Card({ item }) {
  return (
    <article className="card">
      <div
        className="card-media"
        style={{ backgroundImage: `url('${item.image}')` }}
      >
        <span className="card-tag">{item.category}</span>
        {item.type === "video" && <div className="card-play">▶</div>}
      </div>

      <div className="card-body">
        <div className="card-header">
          <div
            className="avatar"
            style={{ backgroundImage: `url('${item.avatar}')` }}
          />
          <div>
            <div className="card-title">{item.username}</div>
            <div className="card-meta">{item.subtitle}</div>
          </div>
        </div>

        <p className="card-description">{item.description}</p>

        <div className="card-footer">
          <span className="badge-pill">{item.tags}</span>
          <span className="location">
            <span className="location-dot"></span> {item.location}
          </span>
        </div>
      </div>
    </article>
  );
}

export default Card;