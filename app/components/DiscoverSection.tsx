interface BookSeriesProps {
  userName: string;
  books: string[];
  likedBook: string;
  themes: string[];
}

function BookSeries({ userName, books, likedBook, themes }: BookSeriesProps) {
  return (
    <div className="book-series-1">
      <div className="book-liked-series">
        <div className="liked-text">Because {userName} liked...</div>
        <div className="discovered-text">She discovered:</div>

        <div className="book-row">
          {books.map((book, index) => (
            <img 
              key={index}
              src={book}
              alt={`Book ${index + 1}`}
              className="book-image"
            />
          ))}

          <div className="arrow-and-liked">
            <svg 
              className="arrow-image" 
              xmlns="http://www.w3.org/2000/svg" 
              width="50" 
              height="50" 
              viewBox="0 0 24 24" 
              fill="#b9b2a4"
            >
              <path d="M22 12l-8 8v-6h-8v-4h8v-6z" />
            </svg>
            <div className="liked-book">
              <img 
                src={likedBook}
                alt={`${userName} liked this book`}
                className="book-image liked"
              />
              <div className="passage-text">
                {themes.map((theme, index) => (
                  <span key={index}>
                    {theme}
                    {index < themes.length - 1 && <>,<br /></>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverSection() {
  const shagunData = {
    userName: 'Shagun',
    books: [
      '/images/book1.jpeg',
      '/images/book2.jpeg',
      '/images/book3.jpeg',
      '/images/book4.jpeg',
      '/images/book9.jpeg',
    ],
    likedBook: '/images/liked-book1.jpeg',
    themes: ['The passage of time', 'The nature of art', 'The female experience'],
  };

  const dristiiiData = {
    userName: 'Dristiii',
    books: [
      '/images/book5.jpeg',
      '/images/book6.jpeg',
      '/images/book7.jpeg',
      '/images/book8.jpeg',
      '/images/book10.jpeg',
    ],
    likedBook: '/images/liked-book2.jpeg',
    themes: ['Manners', 'Upbringing', 'Morality', 'Education'],
  };

  return (
    <div className="discover-section">
      <h2>What will you discover?</h2>
      <BookSeries {...shagunData} />
      <div className="book-series-2">
        <BookSeries {...dristiiiData} />
      </div>
    </div>
  );
}