require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const books = [
  { title: "The Alchemist", author: "Paulo Coelho", description: "Spiritual journey." },
  { title: "1984", author: "George Orwell", description: "Dystopian novel." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", description: "Classic American novel." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", description: "American dream story." },
  { title: "Moby Dick", author: "Herman Melville", description: "Sea adventure." },
  { title: "Pride and Prejudice", author: "Jane Austen", description: "Romantic classic." },
  { title: "The Hobbit", author: "J.R.R. Tolkien", description: "Fantasy adventure." },
  { title: "Harry Potter and the Sorcerer’s Stone", author: "J.K. Rowling", description: "Wizard world." },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", description: "Teenage rebellion." },
  { title: "The Lord of the Rings", author: "J.R.R. Tolkien", description: "Epic fantasy." },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", description: "Philosophical tale." },
  { title: "Fahrenheit 451", author: "Ray Bradbury", description: "Book-burning dystopia." },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", description: "Psychological thriller." },
  { title: "Brave New World", author: "Aldous Huxley", description: "Future dystopia." },
  { title: "The Kite Runner", author: "Khaled Hosseini", description: "Friendship & betrayal." },
  { title: "The Da Vinci Code", author: "Dan Brown", description: "Mystery thriller." },
  { title: "Steve Jobs", author: "Walter Isaacson", description: "Biography." },
  { title: "Sapiens", author: "Yuval Noah Harari", description: "Human history." },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", description: "Mind & psychology." },
  { title: "The Shining", author: "Stephen King", description: "Horror classic." }
];

async function seedBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Book.deleteMany(); // Clears old books
    await Book.insertMany(books);

    console.log("20 Books Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedBooks();
