# Библиотека книг

## Запросы для MongoDB

### 1. Вставка данных (минимум две книги)

```javascript
db.books.insertMany([
  {
    title: "Мастер и Маргарита",
    description: "Роман Михаила Булгакова",
    authors: "Михаил Булгаков",
    favorite: true,
    fileCover: "",
    fileName: "",
    fileBook: ""
  },
  {
    title: "Преступление и наказание",
    description: "Роман Фёдора Достоевского",
    authors: "Фёдор Достоевский",
    favorite: false,
    fileCover: "",
    fileName: "",
    fileBook: ""
  }
]);
```

---

### 2. Поиск по полю `title`

```javascript
db.books.find({ title: "Мастер и Маргарита" });
```

---

### 3. Редактирование полей `description` и `authors` по `_id`

```javascript
db.books.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  {
    $set: {
      description: "Новое описание книги",
      authors: "Новый автор"
    }
  }
);
```
