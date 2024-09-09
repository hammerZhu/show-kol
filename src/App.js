import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectDetail from './projectDetail';
import { sendPostRequest,sendDbRequest } from './myUtils';
import logo from './logo.svg';
import './App.css';

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
  const itemsPerPage = 50;
  const maxPages = 20;

  React.useEffect(() => {
    fetchData(minScore, maxScore);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
    localStorage.setItem('minScore', minScore);
    localStorage.setItem('maxScore', maxScore);
  }, [currentPage, minScore, maxScore]);

  async function fetchData(min = '', max = '') {
    const kolData = await getKolData(min, max);
    if (kolData.length > 0) {
      setData(kolData);
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.min(Math.ceil(data.length / itemsPerPage), maxPages);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = () => {
    fetchData(minScore, maxScore);
    setCurrentPage(1);
    localStorage.setItem('currentPage', 1);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1 style={{ 
            fontSize: '2.5em', 
            fontWeight: 'bold',
            color: '#CCC',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>KOL评分表</h1>
         
          <Routes>
            <Route path="/" element={
              <>
               <div style={{ marginBottom: '20px' }}>
                <input
                  type="number"
                  placeholder="最小分数"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  style={{ 
                    marginRight: '10px', 
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <span style={{ margin: '0 10px', color: '#666' }}>&lt; 分数 &lt;</span>
                <input
                  type="number"
                  placeholder="最大分数"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  style={{ 
                    marginRight: '10px', 
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <button onClick={handleSearch} style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}>搜索</button>
              </div>
                {renderTable(currentItems)}
                {renderPagination(totalPages, currentPage, paginate)}
              </>
            } />
            <Route path="/project/:name" element={<ProjectDetail />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

const renderTable = (data) => {
  return (
    <table style={{ 
      border: '3px solid #4CAF50', 
      borderRadius: '10px', 
      borderCollapse: 'separate', 
      borderSpacing: '0',
      overflow: 'hidden',
      width: '800px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      backgroundColor: 'transparent'  // 将背景色改为透明
    }}>
      <thead>
        <tr style={{ backgroundColor: '#4CAF50' }}>
          <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>KOL名称</th>
          <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>粉丝数</th>
          <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>内容分</th>
          <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>影响力分</th>
        </tr>
      </thead>
      <tbody>
        {renderLine(data)}
      </tbody>
    </table>
  );
};

/*create table kolXAccountDetail(
  screen_name vchar40 primary key not null,
  updatedTime timestamp,
  totalScore integer,
  tweetsDetail vchar500,
  interactors vchar2000,
  influence integer,
  influenceAccouunts vchar2000
);*/
const getKolData = async (minScore = '', maxScore = '') => { 
  let sqlstr = `SELECT k.screen_name AS name, k.totalScore AS score, x.followers, x.description, k.influence 
                FROM kolXAccountDetail k 
                INNER JOIN XAccounts x ON k.screen_name = x.screen_name 
                WHERE 1=1`;
  
  if (minScore !== '') {
    sqlstr += ` AND k.totalScore >= ${minScore}`;
  }
  if (maxScore !== '') {
    sqlstr += ` AND k.totalScore <= ${maxScore}`;
  }
  
  sqlstr += ` ORDER BY k.totalScore DESC LIMIT 1000`;

  let token = '5544Bdc2'; // todo 保存到.env中最好
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
    const { name, score, followers, description, influence } = item;
    return (
      <tr key={index} onClick={() => handleClick(name)} style={{ cursor: 'pointer' }}>
        <td style={{ padding: '10px', fontSize: '0.9em', borderBottom: '1px solid #ddd' }}>{name}</td>
        <td style={{ padding: '10px', fontSize: '0.9em', borderBottom: '1px solid #ddd' }}>{Math.round(followers)}</td>
        <td style={{ padding: '10px', fontSize: '0.9em', borderBottom: '1px solid #ddd' }}>{Math.round(score)}</td>
        <td style={{ padding: '10px', fontSize: '0.9em', borderBottom: '1px solid #ddd' }}>{Math.round(influence)}</td>
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
    <nav>
      <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', padding: 0, marginTop: '20px' }}>
        {pageNumbers.map(number => (
          <li key={number} style={{ margin: '0 5px' }}>
            <button onClick={() => paginate(number)} style={{ 
              padding: '8px 12px', 
              backgroundColor: currentPage === number ? '#4CAF50' : 'white',
              color: currentPage === number ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default App;
