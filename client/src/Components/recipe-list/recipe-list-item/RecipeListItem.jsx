import { Link } from "react-router-dom";

export default function RecipeListItem({
    _id,
    name,
    servings,
    category,
    dietary,
    imageUrl,
    method,
    notes,
}) {
    return (
        <>
            <div className="link-container">
                <div className="home-button-group" >
                    <img className="home-button-image" src={imageUrl} />
                    <p className="home-button-title" >Recipe <br />{name}</p>
                    <div className="data-buttons">
                        <Link to={`/recipes/${_id}/details`} className="btn details-btn">Details</Link>
                    </div>
                </div>
            </div>


        </>
    )
}