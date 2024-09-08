import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProjectDetail from './projectDetail';
import { sendPostRequest,sendDbRequest } from './myUtils';
import logo from './logo.svg';
import './App.css';

function App() {
  const [data, setData] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 50;
  const maxPages = 20;

  React.useEffect(() => {
    async function fetchData() {
      const kolData = await getKolData();
      console.log(kolData);
      if (kolData.length > 0) {
        setData(kolData);
      }
    }
    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.min(Math.ceil(data.length / itemsPerPage), maxPages);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1 style={{ fontSize: '2em', fontWeight: 'bold' }}>KOL评分表</h1>
          <Routes>
            <Route path="/" element={
              <>
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
      border: '1px solid #ddd', 
      borderRadius: '10px', 
      borderCollapse: 'separate', 
      overflow: 'hidden',
      width: '640px'  // 添加这一行
    }}>
      <thead>
        <tr>
          <th>KOL名称</th>
          <th>分数</th>
          <th>粉丝数</th>
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
const getKolData = async () => { 

   let sqlstr=`select k.screen_name as name,k.totalScore as score,x.followers,x.description from kolXAccountDetail k inner join XAccounts x on k.screen_name=x.screen_name order by k.totalScore desc limit 1000`;
   let token='5544Bdc2';//todo 保存到.evn中最好。
   let result = await sendDbRequest(sqlstr);
   console.log("get kol data");
   console.log(result);
   if(result && result.success){
    return result.data;
   }
   return [];
};

const renderLine = (data) => {
  const handleClick = (name) => {
    window.location.href = `/project/${encodeURIComponent(name)}`;
  };

  return data.map((item, index) => {
    const { name, score, followers, description } = item;
    return (
      <tr key={index} onClick={() => handleClick(name)} style={{ cursor: 'pointer' }}>
        <td>{name}</td>
        <td>{Math.round(score)}</td>
        <td>{Math.round(followers)}</td>
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
      <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', padding: 0 }}>
        {pageNumbers.map(number => (
          <li key={number} style={{ margin: '0 5px' }}>
            <button onClick={() => paginate(number)} style={{ 
              padding: '5px 10px', 
              backgroundColor: currentPage === number ? '#4CAF50' : '#ddd',
              color: currentPage === number ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
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
