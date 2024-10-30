import React, { useState } from 'react';
import { sendDbRequest, transformScore, reverseTransformScore } from '../myUtils';
import '../App.css';
import '../index.css';
import { useUser } from '../contexts/UserContext';

function SearchPage() {
  const { user, setUser } = useUser();
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('followers');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState(['DeFi', 'NFT', 'GameFi', 'Web3']);
  const [activeTags, setActiveTags] = useState([]);
  const [minScore, setMinScore] = useState(() => localStorage.getItem('minScore') || '');
  const [maxScore, setMaxScore] = useState(() => localStorage.getItem('maxScore') || '');
  const [minInfluence, setMinInfluence] = useState(() => localStorage.getItem('minInfluence') || '');
  const [maxInfluence, setMaxInfluence] = useState(() => localStorage.getItem('maxInfluence') || '');

  const maxPages = 20;

  const [taggedAccounts, setTaggedAccounts] = useState(new Set());

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
    fetchTags();
  }, []);

  const fetchTags = async () => {
    // 这里应该调用 API 获取所有可用的标签
    let sqlstr = `SELECT tagName FROM kolTags order by tagId`;
    let result = await sendDbRequest(sqlstr);
    if(result && result.success){
      let tags = [];
      for(let i=0;i<result.data.length;i++){
        tags.push(result.data[i].tagName);
      }
      setTags(tags);
    }
    // 暂时使用模拟数据
    //const mockTags = ['中文', 'AI', 'Crypto', 'NFT', 'DeFi'];
    //setTags(mockTags);
  };

  const handleTagClick = async (tag) => {
    let newActiveTags = [];
    if (activeTags.includes(tag)) {
      newActiveTags = activeTags.filter(t => t !== tag);
    } else {
      newActiveTags = [...activeTags, tag];
    }
    setActiveTags(newActiveTags);
    localStorage.setItem('activeTags', JSON.stringify(newActiveTags));

    let tagIndexs = newActiveTags.map(t => tags.indexOf(t) + 1);
    const accounts = await getTags(tagIndexs);
    setTaggedAccounts(new Set(accounts));

    filterData(new Set(accounts));
    setCurrentPage(1);
  };

  const filterData = (taggedAccounts) => {
    if (taggedAccounts.size === 0) {
      setData(allData);
    } else {
      const filteredData = allData.filter(item => taggedAccounts.has(item.name));
      setData(filteredData);
    }
  };

  const fetchData = async (minScore = '', maxScore = '', minInfluence = '', maxInfluence = '') => {
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
      setAllData(transformedData);
      setData(transformedData);
    }
  };

  React.useEffect(() => {
    if (allData.length > 0) {
      filterData(taggedAccounts);
    }
  }, [allData, taggedAccounts]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
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

  const handleTwitterLoginSuccess = (response) => {
    console.log(response);
    window.location.href = response;
  };

  const handleTwitterLogout = () => {
    localStorage.removeItem('twitterData');
    setUser(null);
  };

  const handleTwitterLoginFailure = (error) => {
    console.error(error);
  };

  const handleTwitterLoginResult = (userName) => {
    setUser(userName);
  };

  const filteredData = React.useMemo(() => {
    if (taggedAccounts.size === 0) return currentItems;
    return currentItems.filter(item => taggedAccounts.has(item.name));
  }, [currentItems, taggedAccounts]);

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
    closeSearchModal();
  };
  const handleDefaultSearch = () => {
    // 设置默认搜索条件
    setMinScore('0');
    setMaxScore('100');
    setMinInfluence('0');
    setMaxInfluence('100');
    // 执行搜索
    handleSearch();
  };
  const renderSearchModal = () => {
    if(isSearchModalOpen){
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">Searching conditions</h2>
            <form onSubmit={handleSearchSubmit}>
              <div className="mb-4 flex items-center">
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="w-1/4 bg-gray-700 text-white p-2 rounded mr-2"
                  />
                  <label className="w-1/3 text-center text-lg">{" < content score < "}</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="w-1/4 bg-gray-700 text-white p-2 rounded ml-2"
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={minInfluence}
                    onChange={(e) => setMinInfluence(e.target.value)}
                    className="w-1/4 bg-gray-700 text-white p-2 rounded mr-2"
                  />
                  <label className="w-1/3 text-center text-lg">{" < influence score < "}</label>
                  <input
                    type="number"
                    value={maxInfluence}
                    onChange={(e) => setMaxInfluence(e.target.value)}
                    className="w-1/4 bg-gray-700 text-white p-2 rounded ml-2"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeSearchModal}
                  className="mr-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      else{
        return null;
      }
  }
  // 在组件卸载时清除 localStorage 中的 activeTags
  React.useEffect(() => {
    return () => {
      localStorage.removeItem('activeTags');
    };
  }, []);

  return (
    <>
        <div className="mb-4 flex flex-col gap-2 bg-gray-700 rounded-lg p-4">
            <label className="text-lg font-semibold mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        activeTags.includes(tag)
                        ? 'bg-purple-600 text-gray-200'
                        : 'bg-gray-600 text-gray-200 hover:bg-gray-600'
                    } transition-colors duration-200`}
                    >
                    {tag}
                    </button>
                ))}
            </div>
        </div>
        {renderSearchModal()}
        {renderTable(filteredData, handleSort, sortField, sortDirection)}
        {renderPagination(totalPages, currentPage, paginate)}
    </>
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
  
  sqlstr += ` ORDER BY k.totalScore DESC LIMIT 9000`;

  //let token = '5544Bdc2'; // todo 保存到.env中最好
  console.log(sqlstr);
  let result = await sendDbRequest(sqlstr);
  //console.log("get kol data");
  //console.log(result);
  if (result && result.success) {
    return result.data;
  }
  return [];
};
//读取tags

const getTags = async (tagIds) => {
  if(tagIds.length==0) return [];
  let sqlstr = `SELECT account FROM XAccountTags WHERE tagId=${tagIds[0]}`;
  //todo 多个tag
  let result = await sendDbRequest(sqlstr);
  let ret = [];
  if (result && result.success) {
    
    for(let i=0;i<result.data.length;i++){
       ret.push(result.data[i].account);
    }
  }
  return ret;
}
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

export default SearchPage;
