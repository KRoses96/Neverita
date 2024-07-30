import { useState, useEffect } from 'react';
import './WeeklyMealPlanner.css';

const WeeklyMealPlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [recipes, setRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState(initializeMealPlans());
  const [currentMealType, setCurrentMealType] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecipes();
    fetchWeeklyMealPlans(currentWeek.startDate);
  }, [currentWeek]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        console.error('Failed to fetch recipes, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchWeeklyMealPlans = async (weekStartDate) => {
    const promises = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      promises.push(fetchMealPlanByDate(formattedDate));
    }
    const results = await Promise.all(promises);
    setMealPlans(results);
  };

  const fetchMealPlanByDate = async (date) => {
    try {
      const response = await fetch(`http://localhost:5000/daily-meal-plans/${date}`);
      if (response.ok) {
        const data = await response.json();
        return {
          breakfast: data.breakfast || '',
          lunch: data.lunch || '',
          dinner: data.dinner || '',
        };
      } else {
        console.error('Failed to fetch meal plan, status code:', response.status);
        return { breakfast: '', lunch: '', dinner: '' };
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return { breakfast: '', lunch: '', dinner: '' };
    }
  };

  const handleSelectRecipe = (recipe) => {
    setMealPlans(prevMealPlans => {
      const updatedMealPlans = [...prevMealPlans];
      updatedMealPlans[currentDay][currentMealType] = recipe;
      return updatedMealPlans;
    });
    setCurrentMealType(null);
    setCurrentDay(null);
  };

  const handleAddButtonClick = (day, mealType) => {
    setCurrentMealType(mealType);
    setCurrentDay(day);
  };

  const handleSaveMealPlan = async () => {
    const promises = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek.startDate);
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      const mealPlan = {
        date: formattedDate,
        breakfastId: mealPlans[i].breakfast?.id,
        lunchId: mealPlans[i].lunch?.id,
        dinnerId: mealPlans[i].dinner?.id,
      };
      promises.push(saveMealPlan(mealPlan));
    }
    await Promise.all(promises);
    alert('Meal plan saved successfully');
  };

  const saveMealPlan = async (mealPlan) => {
    try {
      const response = await fetch('http://localhost:5000/daily-meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealPlan),
      });

      if (!response.ok) {
        console.error('Failed to save meal plan, status code:', response.status);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
    }
  };

  const handleWeekChange = (direction) => {
    setCurrentWeek(prevWeek => {
      const newStartDate = new Date(prevWeek.startDate);
      newStartDate.setDate(newStartDate.getDate() + (direction === 'prev' ? -7 : 7));
      return getWeekFromStartDate(newStartDate);
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayOfWeek} ${day}/${month}/${year}`;
  };

  const formatWeekRange = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + 6);
    return `Week from ${formatDate(start)} to ${formatDate(end)}`;
  };

  return (
    <div className="weekly-meal-planner">
      <div className="meal-planner-content">
        <div className="week-range">
          <h2>{formatWeekRange(currentWeek.startDate)}</h2>
        </div>
        <div className="week-navigation">
          <button onClick={() => handleWeekChange('prev')}>{'<'}</button>
          <button onClick={() => handleWeekChange('next')}>{'>'}</button>
        </div>
        <div className="meal-table-and-recipes">
          <table className="meal-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
              </tr>
            </thead>
            <tbody>
              {currentWeek.days.map((day, index) => (
                <tr key={index}>
                  <td>{formatDate(day)}</td>
                  <td>
                    <div>
                      <button onClick={() => handleAddButtonClick(index, 'breakfast')}>Add</button>
                      <p>{mealPlans[index].breakfast ? mealPlans[index].breakfast.name : 'No selection'}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <button onClick={() => handleAddButtonClick(index, 'lunch')}>Add</button>
                      <p>{mealPlans[index].lunch ? mealPlans[index].lunch.name : 'No selection'}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <button onClick={() => handleAddButtonClick(index, 'dinner')}>Add</button>
                      <p>{mealPlans[index].dinner ? mealPlans[index].dinner.name : 'No selection'}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="recipe-list-container">
            <div className="recipe-list">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <ul>
                {filteredRecipes.map((recipe, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectRecipe(recipe)}
                    className={
                      recipe.id === mealPlans[currentDay]?.breakfast?.id ||
                      recipe.id === mealPlans[currentDay]?.lunch?.id ||
                      recipe.id === mealPlans[currentDay]?.dinner?.id
                        ? 'selected'
                        : ''
                    }
                  >
                    {recipe.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="save-button-container">
          <button className="save-button" onClick={handleSaveMealPlan}>Save Meal Plan</button>
        </div>
      </div>
    </div>
  );
};

const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday - Saturday : 0 - 6
  const numDay = now.getDate();
  const startDate = new Date(now); // copy
  startDate.setDate(numDay - dayOfWeek + 1); // set to previous Monday
  const days = Array.from({ length: 7 }, (v, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
  return { startDate: startDate.toISOString().split('T')[0], days };
};

const getWeekFromStartDate = (startDate) => {
  const days = Array.from({ length: 7 }, (v, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
  return { startDate: startDate.toISOString().split('T')[0], days };
};

const initializeMealPlans = () => {
  return Array.from({ length: 7 }, () => ({
    breakfast: '',
    lunch: '',
    dinner: '',
  }));
};

export default WeeklyMealPlanner;