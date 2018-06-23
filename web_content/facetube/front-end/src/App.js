import React, { Component } from 'react';
import YouTube from 'react-youtube'
import './App.css'
import { Badge, Table, PageHeader, Grid, 
	Row, Col, Button, Well,
	ButtonToolbar, ToggleButtonGroup, ToggleButton, FormGroup, 
	ControlLabel, FormControl, Form} from 'react-bootstrap'
import YouTubes from './YouTubes.json'
import socketIOClient from 'socket.io-client'

let getRandomYouTubeByExpression = (expression, prev) => {
	let arr = YouTubes[expression]
	let index = Math.floor(Math.random() * arr.length)
	
	if(arr[prev] == arr[index] && arr.length >= 2) {
		return getRandomYouTubeByExpression(expression, prev)
	} else {
		return arr[index]
	}
}

class App extends Component {
  state = {
		response: '',
		allFaceExpressions: [],
		mostFaceExpressions: [],
		expressionTotal: [],
		showAllExpressions: false,
		showAnalysis: false,
		showSettings: true,
		radioButtonDefault: 1,
		time: {
			day: 1,
			minute: 0,
			second: 0
		},
		currentYouTube: '7HhuHdd0o-M',
		currentExpression: 'happy',
		socket: null
	}
	

  componentDidMount() {
		// setInterval(this.sendTest, 1000*2)
		this.setState({
			socket: socketIOClient()
		}, () => {
			this.state.socket.on('youtube', comm => {
				console.log(`youtube: ${comm}`)
				this.setState({
					currentYouTube: getRandomYouTubeByExpression(this.state.currentExpression, this.state.currentYouTube)
				})
			})
		})


		let getMost = () => this.callApi(`/face/expression/most/?
			day=${this.state.time.day}&
			minute=${this.state.time.minute}&
			second=${this.state.time.second}`)
      .then(res => {
				let ex = res[0].expression ? res[0].expression : 'happy'

				if(ex !== this.state.currentExpression &&
						this.state.socket !== null) {
					this.state.socket.emit('expression change', ex)
				}
        this.setState({
          expressionTotal: res
				})				
				this.setState({
					currentExpression: ex
				})
				
      })
      .catch(err => {
        this.setState({
          expressionTotal: [] 
				})				
        console.log(err)
      })


		let getAll = () => this.callApi(`/face/all/?
			day=${this.state.time.day}&
			minute=${this.state.time.minute}&
			second=${this.state.time.second}`)
			.then(res => {
				this.setState({
					allFaceExpressions: res
				})
			})
			.catch(err => {
				console.log(err)
			})

			getMost()
			getAll()
			setInterval(getMost, 1000*2)
			setInterval(getAll, 1000*2)
	}
	

  callApi = async (api) => {
    const response = await fetch(api)
    const body = await response.json()

    if(response.status !== 200) throw Error(body.message)
		return body
  }

  renderAnalysis = () => {
		let makeCol = () => {
			return this.state.expressionTotal.map(expression => {
				return (
					<Col xs={2} sm={2} md={2} lg={2} className='App-badgeCol'>
							{expression.expression}<br/><Badge>{expression.total}</Badge>
					</Col>
				)
			})
		}

    return (
			<div>
				<Grid className='App-badgeContainer'>
					<Row className='App-badgeRow'>
						{ makeCol() }
					</Row>
				</Grid>
			</div>
		)
	}

	renderButtonToolbar = () => {
		let onChangeValue = (value) => {
			switch(value) {
				case 1:
					this.setState({
						showSettings: true,
						showAnalysis: false,
						showAllExpressions: false
					})
					break;
				case 2:
					this.setState({
						showSettings: false,
						showAnalysis: true,
						showAllExpressions: false
					})
					break;
				case 3:
					this.setState({
						showSettings: false,
						showAnalysis: false,
						showAllExpressions: true
					})
					break;
			}
		}
		
		return (
			<ButtonToolbar className='App-buttonToolbar'>
				<ToggleButtonGroup 
					type="radio"
					name="options" 
					defaultValue={this.state.radioButtonDefault}
					onChange={val => onChangeValue(val)}>
					<ToggleButton value={1}>Settings</ToggleButton>
					<ToggleButton value={2}>Analysis</ToggleButton>
					<ToggleButton value={3}>Face Expressions</ToggleButton>
				</ToggleButtonGroup>
			</ButtonToolbar>		
		)
	}

	renderContentsUnderYouTube = () => {
		return (
			<div>
				{ this.state.showSettings && this.renderSetting() } 
				{ this.state.showAnalysis && this.renderAnalysis() }
				{ this.state.showAllExpressions && this.renderAllExpressions() }
			</div>
		)
	}
	
	renderSetting = () => {

		let onDayChange = (evt) => {
			this.setState({
				time: {
					...this.state.time,
					day: evt.target.value 
				}
			})
		}

		let onMinuteChange = (evt) => {
			this.setState({
				time: {
					...this.state.time,
					minute: evt.target.value 
				}
			})
		}


		let onSecondChange = (evt) => {
			this.setState({
				time: {
					...this.state.time,
					second: evt.target.value 
				}
			})
		}



		return (
			<div>
				<Grid>
					<Row className='App-formRow'>
						<Col className='App-formCol'>
							<Form inline>
								<FormGroup controlId='formInlineDay'>
									<ControlLabel>Days</ControlLabel>{' '}
									<FormControl 
										type='number'
										placeholder={this.state.time.day} 
										min='0'
										onChange={evt => onDayChange(evt)} />
								</FormGroup>{' '}
								<FormGroup controlId='formInlineMinute'>
									<ControlLabel>Minutes</ControlLabel>{' '}
									<FormControl 
										type='number' 
										placeholder={this.state.time.minute} 
										min='0'
										onChange={evt => onMinuteChange(evt)} />
								</FormGroup>{' '}
								<FormGroup controlId='formInlineSeconds'>
									<ControlLabel>Seconds</ControlLabel>{' '}
									<FormControl 
										type='number' 
										placeholder={this.state.time.second} 
										min='0'
										onChange={evt => onSecondChange(evt)}/>
								</FormGroup>{' '}
							</Form>
						</Col>
					</Row>
				</Grid>
			</div>
		)
	}
  
  renderYouTube = () => {
		let opts = {
			height: '390',
			width: '640',
			playerVars: {
				autoplay: 1
			}
		}

    return (
			<div>
				<YouTube
					videoId={this.state.currentYouTube}
					opts={opts}
					onReady={(event) => {
					event.target.pauseVideo()
					}}/>
			</div>
    )
  }

  renderAllExpressions = () => {
		if(this.state.showAllExpressions) {
			return (
				<div>
					<Well bsSize='large'>
						<Table striped bordered condensed hover responsive>
							<thead>
								<tr>
									<th>#</th>
									<th>Time</th>
									<th>Expression</th>
								</tr>
							</thead>
							<tbody>
							{
								this.state.allFaceExpressions.map(expression => {
									return (
									<tr>
										<th>{expression.id}</th>		
										<th>{expression.time}</th>		
										<th>{expression.expression}</th>		
									</tr>
									)
								})
							}
							</tbody>
						</Table>
					</Well>
				</div>
			)
		} else {
			return (
				<Button bsStyle="primary" onClick={() => {
					this.setState({ 
						showAllExpressions: true 
					})}}>
					Show face expression histories
				</Button>
			)
		}
	}

	renderNextButton = () => {

		let onNextButtonClick = () => {
			this.setState({
				currentYouTube: getRandomYouTubeByExpression(this.state.currentExpression, this.state.currentYouTube)
			})
		}

		return (
			<Button bsStyle='primary' bsSize='large' onClick={onNextButtonClick}>
				Next	
			</Button>
		)
	}

	

  render() {
    return (
			<div>
				<Grid>
					<Row className='text-center'>
						<PageHeader>
							FaceTube <small>H/W term project</small>
						</PageHeader>
					</Row>
					<Row className='text-center App-nextButtonRow'>
						{this.renderNextButton()}
					</Row>
					<Row className='text-center'>
						{this.renderYouTube()}
					</Row>
					<Row className='text-center'>
						{this.renderButtonToolbar() }
					</Row>
					<Row className='text-center'>
						{this.renderContentsUnderYouTube() }
					</Row>
				</Grid>
			</div>
    );
  }
}



export default App;
