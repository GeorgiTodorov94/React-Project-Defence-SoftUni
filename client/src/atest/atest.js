/* 
 const [recipes, setRecipes] = useGetAllRecipes();
    const [ownedRecipes, setOwnedRecipes] = useState([]);
    const [searchInputValue, setSearchInputValue] = useState('');
    const { userId } = useAuthContext();

    useEffect(() => {
        const ownerIdRecipesArray = recipes.filter(obj => obj._ownerId === userId);
        setOwnedRecipes(ownerIdRecipesArray);
        console.log(ownedRecipes);
    }, [recipes, searchInputValue]);

    const onChange = (e) => {
        e.preventDefault();

        setSearchInputValue(oldSearchInputValue => ({
            ...oldSearchInputValue,
            [e.target.name]: e.target.value
        }));
    };

    const onSearch = () => {
        console.log(searchInputValue);
    };












*/