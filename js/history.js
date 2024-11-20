class BorrowingHistory {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.loadUserInfo();
        this.loadBorrowingHistory();
        this.initializeEventListeners();
    }

    loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('currentUser').textContent = currentUser.name;
    }

    loadBorrowingHistory() {
        const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const historyTable = document.getElementById('borrowingHistory');
        
        historyTable.innerHTML = '';
        
        const userBorrowings = borrowings.filter(b => b.borrower === currentUser.nim);
        
        userBorrowings.forEach(borrowing => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrowing.equipmentCode}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${new Date(borrowing.borrowDate).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrowing.duration}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrowing.purpose}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${borrowing.status === 'returned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${borrowing.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${borrowing.status === 'borrowed' ? 
                        `<button onclick="history.returnEquipment('${borrowing.equipmentCode}')"
                            class="text-green-600 hover:text-green-900">
                            Return
                        </button>` : 
                        '-'}
                </td>
            `;
            historyTable.appendChild(row);
        });
    }

    initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }

    returnEquipment(code) {
        if (confirm('Are you sure you want to return this equipment?')) {
            let borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
            const borrowing = borrowings.find(b => 
                b.equipmentCode === code && 
                b.borrower === JSON.parse(localStorage.getItem('currentUser')).nim &&
                b.status === 'borrowed'
            );
            
            if (borrowing) {
                borrowing.status = 'returned';
                borrowing.returnDate = new Date().toISOString();
                localStorage.setItem('borrowings', JSON.stringify(borrowings));
                
                // Update equipment status
                let dashboard = new Dashboard();
                const equipment = dashboard.equipments.find(eq => eq.code === code);
                if (equipment) {
                    equipment.status = 'available';
                }
                
                this.loadBorrowingHistory();
                alert('Equipment returned successfully!');
            }
        }
    }
}

// Initialize History when document is loaded
let history;
document.addEventListener('DOMContentLoaded', () => {
    history = new BorrowingHistory();
});