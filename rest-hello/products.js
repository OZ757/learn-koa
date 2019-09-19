let id = 0;

function nextId() {
	id++;
	return 'p' + id;
}

function Product(name, manufacturer, price) {
	this.id = nextId();
	this.name = name;
	this.manufacturer = manufacturer;
	this.price = price;
}

const products = [
	new Product('iPhone 7', 'Apple', 6800),
	new Product('ThinkPad T440', 'Lenovo', 5999),
	new Product('LBP2900', 'Canon', 1099)
];

module.exports = {
	getProducts: () => {
		return products;
	},
	// 利用产品 ID 查找
	getProduct: (id) => {
		for (let i = 0; i < products.length; i++) {
			if (products[i].id === id) {
				return products[i];
			}
		}
		return null;
	},
	// 添加新的产品
	createProduct: (name, manufacturer, price) => {
		const p = new Product(name, manufacturer, price);
		products.push(p);
		return p;
	},
	// 删除产品, 根据 ID
	deleteProduct: (id) => {
		let index = -1;
		for (let i = 0; i < products.length; i++) {
			if (products[i].id === id) {
				index = i;
				break;
			}
		}
		if (index >= 0) {
			return products.splice(index, 1)[0];
		}
		return null;
	}
}; 
