export default function Planner() {

    // use .find() to find the ones with ownerId and list them here for every owned recipe
    return (
        <div>
            <div className="planner-overall-container">
                <div className="search">
                    <div className="searchInput">
                        <input
                            type="text"
                            value=""
                            placeholder="Enter a recipe to search ..." /><button id="clear-button" >X</button>
                    </div>

                    <div className="data-result">
                        {/* recipesSearchList */}
                    </div>
                </div>

                <div className="planner-overall">
                    <h1 className="planner-pagetitle">Planner</h1>
                    <div className="planner-link-container">
                        {/* displayrecipesInPlannerList */}
                    </div>
                </div>

            </div>
        </div>
    )
};
