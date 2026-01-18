interface ListItemProps {
  title: string;
  stats: string;
  imageUrl: string;
}

function ListItem({ title, stats, imageUrl }: ListItemProps) {
  return (
    <div className="list-item">
      <a href="#">{title}</a>
      <span>{stats}</span>
      <div className="list-image">
        <img src={imageUrl} alt={title} />
      </div>
    </div>
  );
}

export default function RightSidebar() {
  const lists = [
    {
      title: 'Best Crime & Mystery Books',
      stats: '7,176 books | 16,467 voters',
      imageUrl: 'https://www.novelsuspects.com/wp-content/uploads/2019/10/True-Crime-Books-That-Are-Scarier-Than-Fiction-Featured-Image.png',
    },
    {
      title: 'Best Books of the 20th Century',
      stats: '7,774 books | 51,186 voters',
      imageUrl: 'https://img.apmcdn.org/2521640aaf07abac7509595bd505d593e1ed0bde/uncropped/f5269d-20150410-bestbooks-20thcentury.jpg',
    },
    {
      title: 'Best for Book Clubs',
      stats: '13,225 books | 17,930 voters',
      imageUrl: 'https://prh.imgix.net/articles/bookclubpicksautumn2023-1600x800.jpg',
    },
  ];

  return (
    <div className="right-sidebar">
      <div className="news-interviews-section">
        <h4>News & Interviews</h4>
        <a href="#" className="news-link">
          The Biggest Book-to-Screen Adaptations of 2024
        </a>
        <div className="news-image">
          <img 
            src="https://images.gr-assets.com/blogs/1726854616p7/2849.jpg" 
            alt="Book to Screen Adaptations"
          />
        </div>
        <div className="news-details">
          <span>20 likes · 6 comments</span>
        </div>
      </div>

      <div className="love-lists-section">
        <h4>Love lists?</h4>
        {lists.map((list, index) => (
          <ListItem key={index} {...list} />
        ))}
        <a href="#" className="more-lists-link">
          More book lists
        </a>
      </div>

      <div className="author-publisher-section">
        <h4>Are you an author or a publisher?</h4>
        <p>
          Gain access to a massive audience of book lovers. Goodreads is a 
          great place to promote your books.
        </p>
        <button className="author-program-btn">Author program</button>
        <button className="advertise-btn">Advertise</button>
      </div>
    </div>
  );
}