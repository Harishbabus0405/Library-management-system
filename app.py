from flask import Flask, flash, request, redirect, render_template, session, url_for
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date, timedelta,datetime

app = Flask(__name__)
app.secret_key = "change-this-secret"

db = pymysql.connect(
    host="localhost",
    user="root",
    password="040506",
    database="lib_db",
    cursorclass=pymysql.cursors.DictCursor
)
cursor = db.cursor()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/selection')
def selection():
    return render_template('selection.html')

@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_pass = request.form.get('confirm_password')
        print("DEBUG FORM DATA:", request.form)

        try:
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                (name, email, password)
            )
            db.commit()
            return redirect(url_for('login'))
        except Exception as err:
            return f"Error: {err}"

    return render_template('register.html')

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if user and user['password'] == password:
            session['user_id'] = user['id']
            session['name'] = user['name']
            return redirect(url_for('dashboard'))
        else:
            return "Invalid email or password" 
    
    return render_template('login.html')

@app.route('/student_register', methods=['GET','POST'])
def student_register():
    if request.method == 'POST':
        name = request.form.get('name')
        register = request.form.get('register')
        email = request.form.get('email')
        dept = request.form.get('dept')
        password = request.form.get('password')
        confirm_pass = request.form.get('confirm_password')

        if password != confirm_pass:
            return "Passwords do not match!"

        hashed_password = generate_password_hash(password)

        try:
            cursor.execute(
                "INSERT INTO students (name, register, email, dept, password) VALUES (%s, %s, %s, %s, %s)",
                (name, register, email, dept, hashed_password)
            )
            db.commit()
            return redirect(url_for('student_login'))
        except Exception as err:
            return f"Error: {err}"

    return render_template('student_register.html')

@app.route('/student_login', methods=['GET', 'POST'])
def student_login():
    if request.method == 'POST':
        register = request.form.get('register')
        email = request.form.get('email')
        password = request.form.get('password')

        cursor.execute(
            "SELECT * FROM students WHERE (register=%s OR email=%s) AND password=%s",
            (register, email, password)
        )
        student = cursor.fetchone()

        if student:
            session['student_id'] = student['id']
            session['student_name'] = student['name']
            return redirect(url_for('view_books'))
        else:
            return render_template('student_login.html', error="Invalid credentials")

    return render_template('student_login.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', name=session['name'])

@app.route('/add_book', methods=['GET', 'POST'])
def add_book():
    if request.method == 'POST':
        title = request.form.get('title')
        author = request.form.get('author')
        isbn = request.form.get('isbn')
        year = request.form.get('year')
        quantity = int(request.form.get('quantity'))

        try:
            cursor = db.cursor()
            cursor.execute(
                "INSERT INTO books (title, author, isbn, year, quantity) VALUES (%s, %s, %s, %s, %s)",
                (title, author, isbn, year, quantity)
            )
            db.commit()
            cursor.close()
            return redirect(url_for('view_books'))
        except Exception as e:
            return f"Error while adding book: {e}"

    return render_template('add_book.html')


@app.route('/view_books')
def view_books():
    cursor.execute("SELECT * FROM books")
    books = cursor.fetchall()
    return render_template('view_books.html', books=books)

@app.route('/delete_book/<int:book_id>', methods=['POST'])
def delete_book(book_id):
    try:
        # Delete transactions first
        cursor.execute("DELETE FROM transactions WHERE book_id=%s", (book_id,))
        # Then delete the book
        cursor.execute("DELETE FROM books WHERE id=%s", (book_id,))
        db.commit()
        flash("Book and all related transactions deleted successfully.", "success")
    except Exception as e:
        flash(f"Error deleting book: {e}", "danger")
    return redirect(url_for('view_books'))



@app.route('/add_student', methods=['GET', 'POST'])
def add_student():
    if request.method == 'POST':
        name = request.form.get('name')
        register = request.form.get('register')
        email = request.form.get('email')
        dept = request.form.get('dept')
        password = request.form.get('password')

        try:
            cursor.execute(
                "INSERT INTO students (name, register, email, dept, password) VALUES (%s, %s, %s, %s, %s)",
                (name, register, email, dept, password)
            )
            db.commit()
            return redirect(url_for('student_login'))
        except Exception as err:
            return f"Error inserting student: {err}"

    return render_template('add_student.html')


@app.route('/view_students')
def view_students():
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    return render_template("view_students.html", students=students)


@app.route('/delete_student/<int:student_id>', methods=['POST'])
def delete_student(student_id):
    try:
        cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))   
        db.commit()
    except Exception as e:
        return f"Error deleting student: {e}"
    
    return redirect(url_for('view_students'))

    


@app.route("/issue_book", methods=["GET", "POST"])
def issue_book():
    # Fetch students
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()

    # Fetch books (only available ones)
    cursor.execute("SELECT * FROM books")
    books = cursor.fetchall()

    if request.method == "POST":
        student_id = request.form["student_id"]
        book_id = request.form["book_id"]
        issue_date = request.form["issue_date"]

        # Insert into transactions
        cursor.execute(
            "INSERT INTO transactions (student_id, book_id, issue_date) VALUES (%s, %s, %s)",
            (student_id, book_id, issue_date)
        )

        # Decrease book quantity
        cursor.execute("UPDATE books SET quantity = quantity - 1 WHERE id = %s", (book_id,))
        db.commit()

        flash("Book issued successfully!", "success")
        return redirect(url_for("issue_book"))

    return render_template("issue_book.html", students=students, books=books, today=date.today())

"""@app.route('/return_book')
def return_book():
    return render_template('return_book.html')
"""

from flask import jsonify
from datetime import date

@app.route('/return_book')
def return_book():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM students")
    students_raw = cursor.fetchall()

    # Prepare JSON-safe students data
    students = []
    for s in students_raw:
        cursor.execute("SELECT t.id as issue_id, b.title, b.isbn, t.issue_date "
                       "FROM transactions t "
                       "JOIN books b ON t.book_id = b.id "
                       "WHERE t.student_id=%s AND t.return_date IS NULL", (s['id'],))
        issued_books = cursor.fetchall()

        # Convert dates to string for JSON
        for b in issued_books:
            b['issue_date'] = b['issue_date'].strftime('%Y-%m-%d')

        students.append({
            'id': s['id'],
            'name': s['name'],
            'register': s['register'],
            'issued_books': issued_books
        })

    today = date.today().strftime('%Y-%m-%d')
    return render_template('return_book.html', students=students, today=today)

@app.route("/process_return_book", methods=["POST"])
def process_return_book():
    issue_id = request.form.get("issue_id")
    return_date = request.form.get("return_date")

    if not issue_id or not return_date:
        flash("Please select a book and date.", "danger")
        return redirect(url_for("return_book"))

    cursor.execute("UPDATE transactions SET return_date=%s WHERE id=%s", (return_date, issue_id))
    cursor.execute("UPDATE books SET quantity = quantity + 1 WHERE id=(SELECT book_id FROM transactions WHERE id=%s)", (issue_id,))
    db.commit()
    flash("Book returned successfully!", "success")
    return redirect(url_for("return_book"))

@app.route('/view_issued_books')
def view_issued_books():
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT ib.id, u.username, b.title, ib.issue_date, ib.due_date, ib.return_date
        FROM issued_books ib
        JOIN users u ON ib.user_id = u.id
        JOIN books b ON ib.book_id = b.id
    """)
    issued = cursor.fetchall()
    return render_template('view_issued_books.html', issued=issued)


@app.route('/issued_returned_books')
def issued_returned_books():
    cursor.execute("""
        SELECT t.id, s.name as student_name, b.title as book_title, b.isbn as book_isbn,
               t.issue_date, t.return_date
        FROM transactions t
        JOIN students s ON t.student_id = s.id
        JOIN books b ON t.book_id = b.id
        ORDER BY t.issue_date DESC
    """)
    records = cursor.fetchall()
    return render_template('issued_returned_books.html', records=records)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)