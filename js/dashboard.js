class Dashboard {
    constructor() {
        this.equipments = [
            { code: 'EQ001', name: 'Oscilloscope', status: 'available', category: 'Electronics' },
            { code: 'EQ002', name: 'Digital Multimeter', status: 'available', category: 'Electronics' },
            { code: 'EQ003', name: 'Function Generator', status: 'available', category: 'Electronics' },
            { code: 'EQ004', name: 'Power Supply', status: 'available', category: 'Electronics' },
            { code: 'EQ005', name: 'Microscope', status: 'available', category: 'Optics' },
            { code: 'EQ006', name: 'Spectrum Analyzer', status: 'available', category: 'Electronics' },
            { code: 'EQ007', name: 'Logic Analyzer', status: 'available', category: 'Electronics' },
            { code: 'EQ008', name: 'PCB Design Kit', status: 'available', category: 'Electronics' }
        ];
        this.initialize();
    }

    initialize() {
        this.loadUserInfo();
        this.initializeEquipments();
        this.loadEquipments();
        this.loadBorrowings();
        this.initializeEventListeners();
        this.updateStatistics();
    }

    loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('currentUser').textContent = currentUser.name;
    }

    initializeEquipments() {
        if (!localStorage.getItem('equipments')) {
            localStorage.setItem('equipments', JSON.stringify(this.equipments));
        }
    }

    loadEquipments() {
        const equipmentList = document.getElementById('equipmentList');
        const equipments = JSON.parse(localStorage.getItem('equipments'));
        
        equipmentList.innerHTML = '';

        equipments.forEach(equipment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${equipment.code}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${equipment.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${equipment.category}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getStatusStyle(equipment.status)}">
                        ${equipment.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${this.getActionButton(equipment)}
                </td>
            `;
            equipmentList.appendChild(row);
        });
    }

    getStatusStyle(status) {
        switch (status.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'borrowed':
                return 'bg-blue-100 text-blue-800';
            case 'maintenance':
                return 'bg-red-100 text-red-800';
            case 'pending_return':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getActionButton(equipment) {
        if (equipment.status === 'available') {
            return `<button onclick="dashboard.showBorrowForm('${equipment.code}')"
                        class="text-blue-600 hover:text-blue-900">
                        Borrow
                    </button>`;
        } else if (equipment.status === 'borrowed') {
            const borrowing = this.getCurrentUserBorrowing(equipment.code);
            if (borrowing) {
                return `<button onclick="dashboard.requestReturn('${equipment.code}')"
                            class="text-green-600 hover:text-green-900">
                            Return
                        </button>`;
            }
        }
        return '-';
    }

    getCurrentUserBorrowing(equipmentCode) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        return borrowings.find(b => 
            b.equipmentCode === equipmentCode && 
            b.borrower === currentUser.nim &&
            b.status === 'borrowed'
        );
    }

    loadBorrowings() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        const userBorrowings = borrowings.filter(b => b.borrower === currentUser.nim);

        const borrowingsList = document.getElementById('borrowingsList');
        if (borrowingsList) {
            borrowingsList.innerHTML = '';

            userBorrowings.forEach(borrowing => {
                const equipment = this.equipments.find(e => e.code === borrowing.equipmentCode);
                if (equipment) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${equipment.code}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${equipment.name}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${new Date(borrowing.borrowDate).toLocaleDateString()}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${borrowing.duration} hours</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${this.getStatusStyle(borrowing.status)}">
                                ${borrowing.status}
                            </span>
                        </td>
                    `;
                    borrowingsList.appendChild(row);
                }
            });
        }
    }

    showBorrowForm(equipmentCode) {
        const equipment = this.equipments.find(e => e.code === equipmentCode);
        if (equipment && equipment.status === 'available') {
            document.getElementById('equipmentCode').value = equipmentCode;
            document.getElementById('borrowForm').classList.remove('hidden');
        }
    }

    requestReturn(code) {
        if (confirm('Are you sure you want to return this equipment?')) {
            let borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
            const borrowing = borrowings.find(b => 
                b.equipmentCode === code && 
                b.borrower === JSON.parse(localStorage.getItem('currentUser')).nim &&
                b.status === 'borrowed'
            );
            
            if (borrowing) {
                borrowing.status = 'pending_return';
                borrowing.returnRequestDate = new Date().toISOString();
                localStorage.setItem('borrowings', JSON.stringify(borrowings));

                // Update equipment status
                let equipments = JSON.parse(localStorage.getItem('equipments'));
                const equipment = equipments.find(e => e.code === code);
                if (equipment) {
                    equipment.status = 'pending_return';
                    localStorage.setItem('equipments', JSON.stringify(equipments));
                }
                
                this.loadEquipments();
                this.loadBorrowings();
                this.updateStatistics();
                alert('Return request submitted. Please return the equipment to lab admin.');
            }
        }
    }

    handleBorrowSubmit(e) {
        e.preventDefault();
        
        const code = document.getElementById('equipmentCode').value;
        const duration = document.getElementById('duration').value;
        const purpose = document.getElementById('purpose').value;
        
        if (!code || !duration || !purpose) {
            alert('Please fill all fields');
            return;
        }

        let equipments = JSON.parse(localStorage.getItem('equipments'));
        const equipment = equipments.find(e => e.code === code);
        
        if (!equipment || equipment.status !== 'available') {
            alert('Equipment is not available');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setHours(dueDate.getHours() + parseInt(duration));

        // Create borrowing record
        const borrowing = {
            id: Date.now().toString(),
            equipmentCode: code,
            borrower: currentUser.nim,
            borrowDate: borrowDate.toISOString(),
            dueDate: dueDate.toISOString(),
            duration: parseInt(duration),
            purpose: purpose,
            status: 'borrowed'
        };

        // Save borrowing record
        let borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        borrowings.push(borrowing);
        localStorage.setItem('borrowings', JSON.stringify(borrowings));

        // Update equipment status
        equipment.status = 'borrowed';
        localStorage.setItem('equipments', JSON.stringify(equipments));

        // Reset form and reload data
        document.getElementById('borrowForm').classList.add('hidden');
        document.getElementById('equipmentBorrowForm').reset();
        this.loadEquipments();
        this.loadBorrowings();
        this.updateStatistics();
        
        alert('Equipment borrowed successfully!');
    }

    updateStatistics() {
        const equipments = JSON.parse(localStorage.getItem('equipments'));
        const totalEquipment = equipments.length;
        const availableEquipment = equipments.filter(e => e.status === 'available').length;
        const borrowedEquipment = equipments.filter(e => e.status === 'borrowed' || e.status === 'pending_return').length;

        document.getElementById('totalEquipment').textContent = totalEquipment;
        document.getElementById('availableEquipment').textContent = availableEquipment;
        document.getElementById('borrowedEquipment').textContent = borrowedEquipment;
    }

    initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        const borrowForm = document.getElementById('equipmentBorrowForm');
        if (borrowForm) {
            borrowForm.addEventListener('submit', (e) => this.handleBorrowSubmit(e));
        }

        // Add event listener for close borrow form button if exists
        const closeBorrowForm = document.getElementById('closeBorrowForm');
        if (closeBorrowForm) {
            closeBorrowForm.addEventListener('click', () => {
                document.getElementById('borrowForm').classList.add('hidden');
            });
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }
}

// Initialize Dashboard when document is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});