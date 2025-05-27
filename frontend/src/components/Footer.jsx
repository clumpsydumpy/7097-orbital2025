const currentYear = new Date().getFullYear();

export default function Footer() {
    
    return (
        <div style={{padding: "12px 0px", backgroundColor : "black", textAlign: 'center', position:'fixed', width: '100%',height : '90px', bottom : '0', left: '0', right: '0', zIndex : '999', color:"white"}}>
            <div>
              <p> &copy; {currentYear} DNAFloraison. All rights reserved.</p>
              <p> For enqueries and collaborations: DNAFloraison@gmail.com</p>
            </div>
        </div>
       
    )
}
