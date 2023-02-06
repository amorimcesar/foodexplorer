import { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext({});

function CartProvider({ children }) {
    const [cart, setCart] = useState( JSON.parse(localStorage.getItem(`@foodexplorer:cart`)) || [])

    const [orders, setOrders] = useState([])

    function handleAddDishToCart(data, quantity, image) {
        try {
            const { id, title, price } = data;
            const priceFormatted = Math.round(quantity * Number(price.replace(',', '.')) * 100) / 100;
            
            const order = { id, title, price: priceFormatted, image, quantity };
            
            const orderIndex = cart.findIndex((userOrder) => userOrder.title === order.title);
            if (orderIndex !== -1) {
                const confirmResult = window.confirm("Item já adicionado ao carrinho, deseja adiciona-lo novamente?");
                if (!confirmResult) {
                    return;
                }
                setCart(prevState => {
                    const newState = [...prevState];
                    newState[orderIndex].quantity += quantity;
                    newState[orderIndex].price = Math.round((newState[orderIndex].price + priceFormatted) * 100) / 100;
                    return newState;
                });
            } else {
                setCart(prevState => [...prevState, order]);
            }
            alert("Item adicionado ao carrinho");
        } catch (error) {
            let errorMessage = "Não foi possível adicionar o item ao carrinho";
            if (error.response) {
                errorMessage = error.response.data.message;
            }
            alert(errorMessage);
        }
    }    

    function handleRemoveDishFromCart(deleted) {
        setCart(prevState => prevState.filter(item => item.id !== deleted))
    }

    const total = cart.reduce((value, item) => {
        return value + item.price
    }, 0) 

    async function handleResetCart() {
        localStorage.removeItem(`@foodexplorer:cart`);
        setCart([]);
    }

    useEffect(() => {
        localStorage.setItem(`@foodexplorer:cart`, JSON.stringify(cart));
    }, [cart])

    return (
        <CartContext.Provider value={{ 
            cart,
            handleAddDishToCart,
            handleRemoveDishFromCart,
            total: String(total.toFixed(2)).replace('.', ','),
            orders,
            setOrders,
            handleResetCart,
        }}>
            { children }
        </CartContext.Provider>
    )
}

function useCart() {
    const context = useContext(CartContext);
    return context;
}

export { CartProvider, useCart };
