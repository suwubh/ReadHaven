export default function SearchBrowseSection() {
  const genres = [
    'Art', 'Biography', 'Business', "Children's", 'Christian',
    'Classics', 'Comics', 'Cookbooks', 'Ebooks', 'Fantasy',
    'Fiction', 'Graphic Novels', 'Historical Fiction', 'History', 'Horror',
    'Memoir', 'Music', 'Mystery', 'Nonfiction', 'Poetry',
    'Psychology', 'Romance', 'Science', 'Science Fiction', 'Self Help',
    'Sports', 'Thriller', 'Travel', 'Young Adult', 'More genres',
  ];

  return (
    <div className="search-browse-section">
      <h3>Search and browse books</h3>
      <input 
        type="text" 
        className="search-input" 
        placeholder="Title / Author / ISBN"
        aria-label="Search books"
      />

      <div className="browse-links-grid">
        {genres.map((genre, index) => (
          <a href="#" key={index}>
            {genre}
          </a>
        ))}
      </div>
    </div>
  );
}