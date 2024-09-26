import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectDetail from './projectDetail';
import { sendPostRequest, sendDbRequest, transformScore, reverseTransformScore } from './myUtils';
import './App.css';
import './index.css';
import TwitterLoginButton from './TwitterLogin';
import LoginTwitter from './loginTwitter';
function App() {
  const [data, setData] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(() => {
    return parseInt(localStorage.getItem('currentPage')) || 1;
  });
  const [minScore, setMinScore] = React.useState(() => {
    return localStorage.getItem('minScore') || '';
  });
  const [maxScore, setMaxScore] = React.useState(() => {
    return localStorage.getItem('maxScore') || '';
  });
  const [minInfluence, setMinInfluence] = React.useState(() => {
    return localStorage.getItem('minInfluence') || '';
  });
  const [maxInfluence, setMaxInfluence] = React.useState(() => {
    return localStorage.getItem('maxInfluence') || '';
  });
  const itemsPerPage = 50;
  const maxPages = 20;

  const [sortField, setSortField] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetchData(minScore, maxScore, minInfluence, maxInfluence);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
    localStorage.setItem('minScore', minScore);
    localStorage.setItem('maxScore', maxScore);
    localStorage.setItem('minInfluence', minInfluence);
    localStorage.setItem('maxInfluence', maxInfluence);
  }, [currentPage, minScore, maxScore, minInfluence, maxInfluence]);

  React.useEffect(() => {
    async function verifyAuth() {
      try {
        let twitterData = localStorage.getItem('twitterData');
        if(twitterData){
           console.log("twitterData=");
           console.log(twitterData);
           const response = await fetch('/api/verifyTwitterAuth', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({twitterData}),
           });
            if(response.ok){
              const data = await response.json();
              console.log("login user=");
              console.log(data);
              setUser(data);
            }
        }
      } catch (error) {
        console.error('验证失败:', error);
      }
    }

    verifyAuth();
  }, []);

  async function fetchData(minScore = '', maxScore = '', minInfluence = '', maxInfluence = '') {
    const minScoreTransformed = minScore !== '' ? reverseTransformScore(parseFloat(minScore)) : '';
    const maxScoreTransformed = maxScore !== '' ? reverseTransformScore(parseFloat(maxScore)) : '';
    const minInfluenceTransformed = minInfluence !== '' ? reverseTransformScore(parseFloat(minInfluence)) : '';
    const maxInfluenceTransformed = maxInfluence !== '' ? reverseTransformScore(parseFloat(maxInfluence)) : '';
    const kolData = await getKolData(minScoreTransformed, maxScoreTransformed, minInfluenceTransformed, maxInfluenceTransformed);
    if (kolData.length > 0) {
      const transformedData = kolData.map(item => ({
        ...item,
        score: transformScore(item.score),
        influence: transformScore(item.influence)
      }));
      setData(transformedData);
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.min(Math.ceil(data.length / itemsPerPage), maxPages);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = () => {
    fetchData(minScore, maxScore, minInfluence, maxInfluence);
    setCurrentPage(1);
    localStorage.setItem('currentPage', 1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = React.useMemo(() => {
    if (!sortField) return currentItems;
    return [...currentItems].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [currentItems, sortField, sortDirection]);

  const handleTwitterLoginSuccess = (response) => {
    console.log(response);
    // 处理登录成功逻辑
    window.location.href = response;
  };
  const handleTwitterLogout = () => {
    //从localstorage中删除twitterData
    localStorage.removeItem('twitterData');
    setUser(null);
  };
  const handleTwitterLoginFailure = (error) => {
    console.error(error);
    // 处理登录失败逻辑
  };
  const handleTwitterLoginResult = (userName) => {
    setUser(userName);
  };
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.location.href = '/'}>
              <img src="/logo.png" alt="Logo" className="h-10 rounded-full" />
              <span className="text-2xl font-bold">DISCOVER</span>
            </div>
            <div className="flex space-x-6">
              {["Projects", "Search"].map((item) => (
                <Link
                  key={item}
                  to="/"
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <img
                    src={`/${item.toLowerCase()}-icon.svg`}
                    alt={item}
                    className="w-6 h-6 mr-2 filter invert"
                  />
                  <span>{item}</span>
                </Link>
              ))}
            </div>
            <TwitterLoginButton
              onSuccess={handleTwitterLoginSuccess}
              onFailure={handleTwitterLoginFailure}
              onLogout={handleTwitterLogout}
              user={user}
            />
          </nav>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <>
                {/* <div className="mb-8 flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-4">
                  <div className="w-full md:w-auto space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={minScore}
                        onChange={(e) => setMinScore(e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-400">&lt; Content Score &lt;</span>
                      <input
                        type="number"
                        placeholder="100"
                        value={maxScore}
                        onChange={(e) => setMaxScore(e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={minInfluence}
                        onChange={(e) => setMinInfluence(e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-400">&lt; Influence Score &lt;</span>
                      <input
                        type="number"
                        placeholder="100"
                        value={maxInfluence}
                        onChange={(e) => setMaxInfluence(e.target.value)}
                        className="w-24 px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSearch} 
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Search
                  </button>
                </div> */}
                {renderTable(sortedItems, handleSort, sortField, sortDirection)}
                {renderPagination(totalPages, currentPage, paginate)}
              </>
            } />
            <Route path="/project/:name" element={<ProjectDetail />} />
            <Route path="/loginTwitter" element={<LoginTwitter onLoginSuccess={handleTwitterLoginResult} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const renderTable = (data, onSort, sortField, sortDirection) => {
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="overflow-x-auto bg-gray-700 rounded-md p-4">
      <div className="p-4">
        <span className="text-2xl font-bold">Smart followers</span> 
      </div> 
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-600">
            {['KOL Name', 'Followers', 'Content Score', 'Influence Score'].map((header, index) => (
              <th 
                key={index}
                onClick={() => onSort(['name', 'followers', 'score', 'influence'][index])}
                className="p-3 text-left cursor-pointer transition-colors duration-200"
              >
                {header}{renderSortIcon(['name', 'followers', 'score', 'influence'][index])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderLine(data)}
        </tbody>
      </table>
    </div>
  );
};

const getKolData = async (minScore = '', maxScore = '', minInfluence = '', maxInfluence = '') => { 
  let sqlstr = `SELECT k.screen_name AS name,  k.totalScore AS score, x.followers, x.description, k.influence,x.name as showName,x.headImage as headImage
                FROM kolXAccountDetail k 
                INNER JOIN XAccounts x ON k.screen_name = x.screen_name 
                WHERE 1=1`;
  
  if (minScore !== '') {
    sqlstr += ` AND k.totalScore >= ${minScore}`;
  }
  if (maxScore !== '') {
    sqlstr += ` AND k.totalScore <= ${maxScore}`;
  }
  if (minInfluence !== '') {
    sqlstr += ` AND k.influence >= ${minInfluence}`;
  }
  if (maxInfluence !== '') {
    sqlstr += ` AND k.influence <= ${maxInfluence}`;
  }
  
  sqlstr += ` ORDER BY k.totalScore DESC LIMIT 1000`;

  //let token = '5544Bdc2'; // todo 保存到.env中最好
  console.log(sqlstr);
  let result = await sendDbRequest(sqlstr);
  console.log("get kol data");
  console.log(result);
  if (result && result.success) {
    return result.data;
  }
  return [];
};

const renderLine = (data) => {
  const handleClick = (name) => {
    window.location.href = `/project/${encodeURIComponent(name)}`;
  };

  return data.map((item, index) => {
    const { name, score, followers, description, influence,headImage,showName } = item;
    return (
      <tr 
        key={index} 
        onClick={() => handleClick(name)} 
        className="cursor-pointer hover:bg-gray-800 transition-colors duration-200 border-b border-gray-600"
      >
        <td className="p-3">
        <div className="flex items-center">
          <img src={headImage} alt="头像" className="w-10 h-10 rounded-full mr-3" />
          <div>
            <div className="font-bold">{showName}</div>
            <div className="text-sm text-gray-500">@{name}</div>
          </div>
          </div>
        </td>

        <td className="p-3 text-center">{Math.round(followers)}</td>
        <td className="p-3 text-center">{score.toFixed(2)}</td>
        <td className="p-3 text-center">{influence.toFixed(2)}</td>
      </tr>
    );
  });
};

const renderPagination = (totalPages, currentPage, paginate) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-6">
      <ul className="flex justify-center space-x-2">
        {currentPage > 3 && (
          <>
            <li>
              <button 
                onClick={() => paginate(1)} 
                className="px-3 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
              >
                1
              </button>
            </li>
            <li>...</li>
          </>
        )}
        {[...Array(5)].map((_, index) => {
          const pageNumber = currentPage - 2 + index;
          if (pageNumber > 0 && pageNumber <= totalPages) {
            return (
              <li key={pageNumber}>
                <button 
                  onClick={() => paginate(pageNumber)} 
                  className={`px-3 py-2 rounded-md ${
                    currentPage === pageNumber 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } transition-colors duration-200`}
                >
                  {pageNumber}
                </button>
              </li>
            );
          }
          return null;
        })}
        {currentPage < totalPages - 2 && (
          <>
            <li>...</li>
            <li>
              <button 
                onClick={() => paginate(totalPages)} 
                className="px-3 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default App;
