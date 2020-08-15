import React from 'react';
import './App.css';
import AppNav from "./AppNav";
import axios from 'axios';
import { getWeb3, getInstance}  from "./Web3Util";
import backgroundImg from './13.jpg';

var sectionStyle = {
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${backgroundImg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
};

class PublishArt extends React.Component {
    constructor(props) {
      super(props);
      this.imageChange = this.imageChange.bind(this);
      this.submitHandler = this.submitHandler.bind(this);
      this.changeHandler = this.changeHandler.bind(this);
      this.state = { 
            imageValue: 'images/upload-file.png',
            description: '',
            title: '', 
            authorName: '',
            price: 0,
            date:'',
            user: '',
            balance: 0,
            contractInstance: '',
            networkId:'',
            networkType:'',
            selectedFile: null,
        };
    }
    componentDidMount = async () => {
        const web3 = await getWeb3();
        window.web3 = web3;
        const contractInstance = await getInstance(web3);
        window.user = (await web3.eth.getAccounts())[0];
        const balanceInWei = await web3.eth.getBalance(window.user);
        var balance = web3.utils.fromWei(balanceInWei, 'ether');
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        this.setState({ user: window.user });
        this.setState({ balance: balance});
        this.setState({ contractInstance: contractInstance });
        this.setState({ networkId: networkId});
        this.setState({ networkType: networkType});
      }
    imageChange = (event) => {
        this.setState({ imageValue: event.target.value });
    };
    categoryChange = (event) => {
        this.setState({ categoryValue: event.target.value });
    };
    submitHandler = (event) => {
        event.preventDefault();
        const {  imageValue, description, title, authorName, price, date} = this.state;
        if(this.isNotEmpty(title) &&this.isNotEmpty(description) &&this.isNotEmpty(authorName) 
            &&this.isNotEmpty(date)&&this.isNotEmpty(imageValue) && this.isNotEmpty(price) && imageValue !== "images/upload-file.png") {
            const priceInWei =  window.web3.utils.toWei(price, 'ether');
            this.publishArt(title, description, date, authorName, priceInWei, imageValue);  
        }
    };
    isNotEmpty(val) {
        return val&& val.length>0;
    }
    changeHandler = event => {
        this.setState({
            [event.target.name]: event.target.value
            }, function(){ })
    };
    onChangeHandler= event=>{
        var files = event.target.files
        if(this.maxSelectFile(event) && this.checkMimeType(event)){
           this.setState({
           selectedFile: files[0]
        })
     }
    }
    onClickHandler = () => {
        const data = new FormData()
        data.append('file', this.state.selectedFile)
        axios.post("http://localhost:8000/upload", data, { 
           // receive two    parameter endpoint url ,form data
       }).then(res => { // then print response status
        console.log(res.statusText)
        this.setState({ imageValue: "images/" + this.state.selectedFile.name });
     })
    }
    maxSelectFile=(event)=>{
        let files = event.target.files // create file object
            if (files.length > 1) { 
               const msg = 'Only upload single image'
               event.target.value = null // discard selected file
               console.log(msg)
              return false;
          }
        return true;
     }
     checkMimeType=(event)=>{
        //getting file object
        let files = event.target.files 
        //define message container
        let err = ''
        // list allow mime type
       const types = ['image/png', 'image/jpeg', 'image/gif']
        // loop access array
        for(var x = 0; x<files.length; x++) {
         // compare file type find doesn't matach
             if (types.every(type => files[x].type !== type)) {
             // create error message and assign to container   
             err += files[x].type+' is not a supported format\n';
           }
         };
      
       if (err !== '') { // if message not same old that mean has error 
            event.target.value = null // discard selected file
            console.log(err)
             return false; 
        }
       return true;
      
      }
    async publishArt(title, description, date, authorName, price, imageValue) {
        try {
            await this.state.contractInstance.methods.createTokenAndSellArt(title,description, date, authorName, price, imageValue).send({
                from: this.state.user , gas: 3141592
            })
            this.props.history.push(`/home`)
            window.location.reload(); 
        } catch (e) {console.log('Error', e)}
    }

//     render() {
//       return (
//         <div style={sectionStyle}>
//             <AppNav></AppNav>
//             <section className="mx-auto" style={{ marginTop: '20px'}}>
//                 <div className="row">
//                     <div className="col-md-2 mb-md-0 mb-5"></div>
//                     <div className="col-md-8 mb-md-0 mb-5">
//                         <div className="card">
//                             <div className="card-body">
//                                 <form className="text-center border border-light p-5" onSubmit={this.submitHandler}>
//                                     <p className="h4 mb-4">Submit your digital art today.</p>
//                                     <div className="row">
//                                         <div className="col-md-6 mb-md-0 mb-5">
//                                             <input className="form-control mb-4" id="title" name="title" type="text" placeholder="Title" onChange={this.changeHandler}  value={this.state.title}/>
//                                             <input className="form-control mb-4" id="description" name="description"  type="text" placeholder="Description" onChange={this.changeHandler}  value={this.state.description}/>
//                                            <input className="form-control mb-4" id="authorName" name="authorName" type="text" placeholder="Author Name" onChange={this.changeHandler}  value={this.state.authorName}/>

//                                         </div>
//                                         <div className="col-md-6 mb-md-0 mb-5">
//                                            <input className="form-control mb-4" id="price" name="price"  type="text" placeholder="Price (ether)"  onChange={this.changeHandler}  value={this.state.price}/>
//                                            <input className="form-control mb-4" id="date" name="date"  type="text" placeholder="Date" onChange={this.changeHandler}   value={this.state.date}/>
//                                             <img className="imgBox z-depth-4 rounded" alt="art" src={this.state.imageValue} /><br></br><br></br>
//                                             <input type="file" name="file" onChange={this.onChangeHandler}/>
//                                             <br></br>
//                                             <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
//                                         </div>
//                                     </div>
//                                     <br></br><br></br>
//                                     <div className="row">
//                                         <div className="col-md-5 mb-md-0 mb-5"></div>
//                                         <div className="col-md-2 mb-md-0 mb-5"><button className="btn btn-info btn-block" type="submit">Publish</button></div>
//                                         <div className="col-md-5 mb-md-0 mb-5"></div>
//                                     </div>
                                    
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-md-2 mb-md-0 mb-5"></div>
//                 </div>

//             </section>
//         </div>

//       );
//     }
//   }
//   export default PublishArt;


render() {
    return (
        <div style={sectionStyle}>
          <AppNav></AppNav>
          <section className="mx-auto" style={{ marginTop: '20px'}}>
              <div className="row">
                  <div className="col-md-2 mb-md-0 mb-5"></div>
                  <div className="col-md-8 mb-md-0 mb-5">
                      <div className="card">
                          <div className="card-body">
                              <form className="text-center border border-light p-5" onSubmit={this.submitHandler}>
                                  <p className="h4 mb-4">Submit your digital art today.</p>
                                  <div className="row">
                                        <div className="col-md-3"></div>
                                      <div className="col-md-6 mb-md-0 mb-5">
                                          <input className="form-control mb-4" id="title" name="title" type="text" placeholder="Title" onChange={this.changeHandler}  value={this.state.title}/>
                                          <input className="form-control mb-4" id="description" name="description"  type="text" placeholder="Description" onChange={this.changeHandler}  value={this.state.description}/>
                                         <input className="form-control mb-4" id="authorName" name="authorName" type="text" placeholder="Author Name" onChange={this.changeHandler}  value={this.state.authorName}/>

                                      </div>
                                        <div className="col-md-3"></div>
                                      
                                  </div>
                                  <div className="row">
                                      <div className="col-md-3"></div>
                                        <div className="col-md-6 mb-md-0 mb-5">
                                            <input className="form-control mb-4" id="price" name="price" type="text" placeholder="Price (ether)" onChange={this.changeHandler} value={this.state.price} />
                                            <input className="form-control mb-4" id="date" name="date" type="text" placeholder="Date" onChange={this.changeHandler} value={this.state.date} />
                                            <img className="imgBox z-depth-4 rounded" alt="art" src={this.state.imageValue} /><br></br><br></br>
                                            <input type="file" name="file" onChange={this.onChangeHandler} />
                                            <br></br>
                                            <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
                                        </div>
                                        <div className="col-md-3"></div>
                                  </div>
                                  <br></br><br></br>
                                  <div className="row">
                                      <div className="col-md-5 mb-md-0 mb-5"></div>
                                      <div className="col-md-2 mb-md-0 mb-5"><button className="btn btn-info btn-block" type="submit">Publish</button></div>
                                      <div className="col-md-5 mb-md-0 mb-5"></div>
                                  </div>
                                  
                              </form>
                          </div>
                      </div>
                  </div>
                  <div className="col-md-2 mb-md-0 mb-5"></div>
              </div>

          </section>
      </div>

    );
  }
}
export default PublishArt;