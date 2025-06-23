import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import Footer from './components/Footer'
import Header from './components/Header'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Header />
    //div to wrap main App
    <div style={{
      flexGrow: 1, // div takes up all available vertical space
      overflowY: 'auto', // enables vertical scrolling for this div if  content overflows
      marginTop: '120px', // Push content down below the fixed Header, currently 100px
      marginBottom: '90px', // Push content up above the fixed Footer, currently90px
      paddingBottom: '0px', // padding at the bottom of the scrollable area
    }}>
      <App /> {/* Your main application content */}
    </div>
    <Footer />
  </React.StrictMode>
)
