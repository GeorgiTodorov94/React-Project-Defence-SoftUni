import { useEffect } from "react"
import { useState } from "react"

export default function NewIngredientItem({ name, value }) {
    const [word, setWord] = useState('');
    const [deleteItem, setDeleteItem] = useState([]);

    useEffect(() => {
        setWord(name)
    }, [name]);

    return (
        <>
            {
                <li className="ingredient-text" key={word}>
                    {` ${value} `}
                </li>
            }
        </>
    );
};

// ingredients.map((item, index) => (
//     <p className="ingredient-text" key={index}>
//         {Object.entries(item).map(([word, value]) => {
//             return (
//                 <NewIngredientItem word={word} value={value} />

//             )
//         })}
//     </p>
// ))