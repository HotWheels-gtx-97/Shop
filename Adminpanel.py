import sys
import json
import os
import datetime
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLineEdit, QLabel, QTableWidget,
    QTableWidgetItem, QMessageBox, QComboBox
)

FILE = "products.json"

CATEGORIES = [
    "bestseller", "mostwanted", "limited",
    "newarrival", "rare", "giftset"
]

AVAILABILITY = [
    "in-stock", "low-stock", "sold-out"
]

def load_data():
    try:
        with open(FILE, "r") as f:
            data = json.load(f)
            return data.get("products", [])
    except:
        return []

def save_data(data):
    with open(FILE, "w") as f:
        json.dump({"products": data}, f, indent=4)

def auto_push():
    os.system("git add .")
    os.system(f'git commit -m "Update {datetime.datetime.now()}"')
    os.system("git push")

class AdminPanel(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Admin Panel")
        self.setGeometry(200, 200, 700, 500)

        self.data = load_data()

        layout = QVBoxLayout()

        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["Name", "Price", "Image URL", "Info"])
        self.table.cellClicked.connect(self.load_selected)
        layout.addWidget(self.table)

        # Inputs
        self.name = QLineEdit()
        self.price = QLineEdit()
        self.img = QLineEdit()
        self.info = QLineEdit()

        self.category = QComboBox()
        self.category.addItems(CATEGORIES)

        self.availability = QComboBox()
        self.availability.addItems(AVAILABILITY)

        layout.addWidget(QLabel("Name"))
        layout.addWidget(self.name)

        layout.addWidget(QLabel("Price"))
        layout.addWidget(self.price)

        layout.addWidget(QLabel("Category"))
        layout.addWidget(self.category)

        layout.addWidget(QLabel("Availability"))
        layout.addWidget(self.availability)

        layout.addWidget(QLabel("Image URL"))
        layout.addWidget(self.img)

        layout.addWidget(QLabel("Info"))
        layout.addWidget(self.info)

        # Buttons
        btn_layout = QHBoxLayout()

        new_btn = QPushButton("New / Empty")
        new_btn.clicked.connect(self.clear_inputs)

        add_btn = QPushButton("Add")
        add_btn.clicked.connect(self.add_item)

        update_btn = QPushButton("Update")
        update_btn.clicked.connect(self.update_item)

        delete_btn = QPushButton("Delete")
        delete_btn.clicked.connect(self.delete_item)

        move_up_btn = QPushButton("⬆ Move Up")
        move_up_btn.clicked.connect(self.move_up)

        move_down_btn = QPushButton("⬇ Move Down")
        move_down_btn.clicked.connect(self.move_down)

        btn_layout.addWidget(new_btn)
        btn_layout.addWidget(add_btn)
        btn_layout.addWidget(update_btn)
        btn_layout.addWidget(delete_btn)
        btn_layout.addWidget(move_up_btn)
        btn_layout.addWidget(move_down_btn)

        layout.addLayout(btn_layout)

        self.setLayout(layout)
        self.refresh_table()

    # REFRESH TABLE
    def refresh_table(self):
        self.table.clearContents()
        self.table.setRowCount(len(self.data))

        for row, item in enumerate(self.data):
            self.table.setItem(row, 0, QTableWidgetItem(item.get("name", "")))
            self.table.setItem(row, 1, QTableWidgetItem(str(item.get("price", ""))))

            img = item.get("images", [""])
            self.table.setItem(row, 2, QTableWidgetItem(img[0] if img else ""))

            self.table.setItem(row, 3, QTableWidgetItem(item.get("description", "")))

    # ADD (TOP INSERT)
    def add_item(self):
        if QMessageBox.question(self, "Confirm", "Add product?") != QMessageBox.StandardButton.Yes:
            return

        new_id = max([i.get("id", 0) for i in self.data], default=0) + 1

        item = {
            "id": new_id,
            "name": self.name.text(),
            "price": int(self.price.text()) if self.price.text().isdigit() else 0,
            "category": self.category.currentText(),
            "availability": self.availability.currentText(),
            "images": [self.img.text()],
            "description": self.info.text()
        }

        self.data.insert(0, item)

        save_data(self.data)

        if QMessageBox.question(self, "Push?", "Push to GitHub?") == QMessageBox.StandardButton.Yes:
            auto_push()

        self.refresh_table()
        self.clear_inputs()
        self.table.selectRow(0)

    # UPDATE
    def update_item(self):
        row = self.table.currentRow()
        if row < 0:
            QMessageBox.warning(self, "Error", "Select row")
            return

        if QMessageBox.question(self, "Confirm", "Update product?") != QMessageBox.StandardButton.Yes:
            return

        self.data[row]["name"] = self.name.text()
        self.data[row]["price"] = int(self.price.text()) if self.price.text().isdigit() else 0
        self.data[row]["category"] = self.category.currentText()
        self.data[row]["availability"] = self.availability.currentText()
        self.data[row]["images"] = [self.img.text()]
        self.data[row]["description"] = self.info.text()

        save_data(self.data)

        if QMessageBox.question(self, "Push?", "Push to GitHub?") == QMessageBox.StandardButton.Yes:
            auto_push()

        self.refresh_table()

    # DELETE
    def delete_item(self):
        row = self.table.currentRow()
        if row < 0:
            return

        if QMessageBox.question(self, "Confirm", "Delete product?") != QMessageBox.StandardButton.Yes:
            return

        self.data.pop(row)
        save_data(self.data)

        if QMessageBox.question(self, "Push?", "Push to GitHub?") == QMessageBox.StandardButton.Yes:
            auto_push()

        self.refresh_table()

    # MOVE UP
    def move_up(self):
        row = self.table.currentRow()
        if row <= 0:
            return

        self.data[row], self.data[row - 1] = self.data[row - 1], self.data[row]
        save_data(self.data)

        self.refresh_table()
        self.table.selectRow(row - 1)

    # MOVE DOWN
    def move_down(self):
        row = self.table.currentRow()
        if row < 0 or row >= len(self.data) - 1:
            return

        self.data[row], self.data[row + 1] = self.data[row + 1], self.data[row]
        save_data(self.data)

        self.refresh_table()
        self.table.selectRow(row + 1)

    # LOAD SELECTED
    def load_selected(self, row, col):
        item = self.data[row]

        self.name.setText(item.get("name", ""))
        self.price.setText(str(item.get("price", "")))

        img = item.get("images", [""])
        self.img.setText(img[0] if img else "")

        self.info.setText(item.get("description", ""))

        self.category.setCurrentText(item.get("category", "bestseller"))
        self.availability.setCurrentText(item.get("availability", "in-stock"))

    # CLEAR INPUTS (EMPTY CARD 🔥)
    def clear_inputs(self):
        self.name.clear()
        self.price.clear()
        self.img.clear()
        self.info.clear()
        self.category.setCurrentIndex(0)
        self.availability.setCurrentIndex(0)


app = QApplication(sys.argv)
window = AdminPanel()
window.show()
sys.exit(app.exec())