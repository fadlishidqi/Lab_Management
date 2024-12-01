class AdminPanel {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.loadUserInfo();
        this.loadStatistics();
        this.initializeEquipments(); 
        this.loadEquipments();
        this.loadActiveBorrowings();
        this.initializeEventListeners();
    }

    initializeEquipments() {
        const defaultEquipments = [
            { code: 'EQ001', name: 'Pulse Meter', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ002', name: 'Blood Pressure Monitor', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ003', name: '3 Infrared Ear Thermometer', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ004', name: 'Hand Dynamometer', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ005', name: 'Heart Rate Monitor (Polar Vantage V2)', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ006', name: 'Spirometer', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ007', name: 'Actiwatch Spectrum Plus', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ008', name: 'Digital Force Gauge', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ009', name: 'Galvanic Skin Response', status: 'available', category: 'Fisiologi', price: 10000 },
            { code: 'EQ010', name: 'Heart Rate Monitor (Polar Ignite)', status: 'available', category: 'Fisiologi', price: 10000 }
        ];
    
        if (!localStorage.getItem('equipments')) {
            localStorage.setItem('equipments', JSON.stringify(defaultEquipments));
        }
    }

    loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('currentUser').textContent = currentUser.name;
    }

    loadStatistics() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        const equipments = JSON.parse(localStorage.getItem('equipments') || '[]');

        const activeBorrowings = borrowings.filter(b => b.status === 'borrowed' || b.status === 'pending_return');
        const pendingReturns = borrowings.filter(b => b.status === 'pending_return');

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeBorrowings').textContent = activeBorrowings.length;
        document.getElementById('pendingReturns').textContent = pendingReturns.length;
        document.getElementById('totalEquipment').textContent = equipments.length;
    }

    loadEquipments() {
        const equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
        const equipmentList = document.getElementById('equipmentList');
        
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
                        ${this.capitalizeFirstLetter(equipment.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">Rp ${Number(equipment.price).toLocaleString('id-ID')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="adminPanel.editEquipment('${equipment.code}')"
                        class="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                    </button>
                    <button onclick="adminPanel.deleteEquipment('${equipment.code}')"
                        class="text-red-600 hover:text-red-900">
                        Delete
                    </button>
                </td>
            `;
            equipmentList.appendChild(row);
        });
    }

    loadActiveBorrowings() {
        const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
        const activeBorrowingsList = document.getElementById('activeBorrowingsList');

        activeBorrowingsList.innerHTML = '';

        const activeBorrowings = borrowings.filter(b => 
            b.status === 'borrowed' || b.status === 'pending_return'
        );

        activeBorrowings.forEach(borrowing => {
            const user = users.find(u => u.nim === borrowing.borrower);
            const equipment = equipments.find(e => e.code === borrowing.equipmentCode);

            if (!user || !equipment) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.nim}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${equipment.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${new Date(borrowing.borrowDate).toLocaleDateString()}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrowing.duration} hours</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrowing.purpose}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getStatusStyle(borrowing.status)}">
                        ${this.capitalizeFirstLetter(borrowing.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${this.getActionButton(borrowing)}
                </td>
            `;
            activeBorrowingsList.appendChild(row);
        });

        if (activeBorrowings.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No active borrowings found
                </td>
            `;
            activeBorrowingsList.appendChild(row);
        }
    }

    getStatusStyle(status) {
        switch (status.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'borrowed':
                return 'bg-blue-100 text-blue-800';
            case 'pending_return':
                return 'bg-yellow-100 text-yellow-800';
            case 'maintenance':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getActionButton(borrowing) {
        if (borrowing.status === 'pending_return') {
            return `
                <button onclick="adminPanel.verifyReturn('${borrowing.id}')"
                    class="text-green-600 hover:text-green-900">
                    Verify Return
                </button>
            `;
        }
        return '-';
    }

    editEquipment(code) {
        const equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
        const equipment = equipments.find(e => e.code === code);
        
        if (equipment) {
            // Create and show edit modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-8 max-w-md w-full">
                    <h3 class="text-lg font-semibold mb-4">Edit Equipment</h3>
                    <form id="editEquipmentForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Equipment Code</label>
                            <input type="text" id="editCode" value="${equipment.code}" readonly
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="editName" value="${equipment.name}" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <select id="editCategory" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="Fisiologi" ${equipment.category === 'Fisiologi' ? 'selected' : ''}>Fisiologi</option>
                                <option value="Lingkungan Fisik" ${equipment.category === 'Lingkungan Fisik' ? 'selected' : ''}>Lingkungan Fisik</option>
                                <option value="Kognitif" ${equipment.category === 'Kognitif' ? 'selected' : ''}>Kognitif</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select id="editStatus" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="available" ${equipment.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="borrowed" ${equipment.status === 'borrowed' ? 'selected' : ''}>Borrowed</option>
                                <option value="maintenance" ${equipment.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" id="editPrice" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value="${equipment.price}">
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                                Cancel
                            </button>
                            <button type="submit" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Add submit handler to the edit form
            document.getElementById('editEquipmentForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const updatedEquipment = {
                    code: document.getElementById('editCode').value,
                    name: document.getElementById('editName').value,
                    category: document.getElementById('editCategory').value,
                    status: document.getElementById('editStatus').value,
                    price: document.getElementById('editPrice').value
                };

                // Update equipment in storage
                const equipmentIndex = equipments.findIndex(e => e.code === code);
                if (equipmentIndex !== -1) {
                    equipments[equipmentIndex] = {
                        ...equipments[equipmentIndex],  // Mempertahankan properti lain
                        ...updatedEquipment  // Update dengan data baru
                    };
                    localStorage.setItem('equipments', JSON.stringify(equipments));
                    
                    // Refresh display
                    this.loadEquipments();  // Memuat ulang daftar equipment
                    this.loadStatistics();  // Memuat ulang statistik
                    modal.remove();
                    alert('Equipment updated successfully!');
                }
            });
        }
    }

    showAddEquipmentForm() {
        document.getElementById('addEquipmentForm').classList.remove('hidden');
    }

    hideAddEquipmentForm() {
        document.getElementById('addEquipmentForm').classList.add('hidden');
        document.getElementById('equipmentForm').reset();
    }

    addEquipment(e) {
        e.preventDefault();
        const code = document.getElementById('equipmentCode').value;
        const name = document.getElementById('equipmentName').value;
        const category = document.getElementById('equipmentCategory').value;
        const price = document.getElementById('equipmentPrice').value;
    
        let equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
    
        if (equipments.some(e => e.code === code)) {
            alert('Kode peralatan sudah ada');
            return;
        }
    
        const newEquipment = {
            code,
            name,
            category,
            status: 'available',
            price
        };
    
        equipments.push(newEquipment);
        localStorage.setItem('equipments', JSON.stringify(equipments));
    
        this.hideAddEquipmentForm();
        this.loadEquipments();
        this.loadStatistics();
        alert('Peralatan berhasil ditambahkan!');
    }

    deleteEquipment(code) {
        if (confirm('Are you sure you want to delete this equipment?')) {
            let equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
            equipments = equipments.filter(e => e.code !== code);
            localStorage.setItem('equipments', JSON.stringify(equipments));
            
            this.loadEquipments();
            this.loadStatistics();
            alert('Equipment deleted successfully!');
        }
    }

    verifyReturn(borrowingId) {
        document.getElementById('returnForm').classList.remove('hidden');
        document.getElementById('returnBorrowingId').value = borrowingId;
    }

    handleReturn(e) {
        e.preventDefault();
        const borrowingId = document.getElementById('returnBorrowingId').value;
        const condition = document.getElementById('equipmentCondition').value;
        const notes = document.getElementById('returnNotes').value;

        let borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
        let equipments = JSON.parse(localStorage.getItem('equipments') || '[]');

        const borrowing = borrowings.find(b => b.id === borrowingId);
        if (borrowing) {
            borrowing.status = 'returned';
            borrowing.returnDate = new Date().toISOString();
            borrowing.returnCondition = condition;
            borrowing.returnNotes = notes;

            const equipment = equipments.find(e => e.code === borrowing.equipmentCode);
            if (equipment) {
                equipment.status = condition === 'good' ? 'available' : 'maintenance';
            }

            localStorage.setItem('borrowings', JSON.stringify(borrowings));
            localStorage.setItem('equipments', JSON.stringify(equipments));

            document.getElementById('returnForm').classList.add('hidden');
            document.getElementById('equipmentReturnForm').reset();
            
            this.loadStatistics();
            this.loadEquipments();
            this.loadActiveBorrowings();
            
            alert('Return verified successfully!');
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).replace('_', ' ');
    }

    initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                }
            });
        }

        const equipmentForm = document.getElementById('equipmentForm');
        if (equipmentForm) {
            equipmentForm.addEventListener('submit', (e) => this.addEquipment(e));
        }
        const returnForm = document.getElementById('equipmentReturnForm');
        if (returnForm) {
            returnForm.addEventListener('submit', (e) => this.handleReturn(e));
        }

        const cancelReturn = document.getElementById('cancelReturn');
        if (cancelReturn) {
            cancelReturn.addEventListener('click', () => {
                document.getElementById('returnForm').classList.add('hidden');
            });
        }
    }
}

// Initialize Admin Panel when document is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});