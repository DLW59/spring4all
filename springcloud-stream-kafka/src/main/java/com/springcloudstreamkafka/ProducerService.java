package com.springcloudstreamkafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProducerService {

	@Autowired
	private MessageSender messageSender;
	
	@RequestMapping("/api/project")
	@Scheduled(fixedDelay = 100000L)
	public void getGreetings() {
		Address address=new Address();
		address.setStreetName("富臣大道");
		address.setApartmentOrHouseNumber("STE 350");
		address.setCity("成都");
		address.setState("VA");
		address.setCountry("四川");
		
		
		Project project=new Project();
		project.setProjectLocation("Falls Church,VA");
		project.setProjectName("PostIT");
		project.setProjectAddress(address);
		
		//Send Address Object
		Message<Address> message = new Message<>("Address", address);
	    messageSender.send(message);
	    
	    
	    //Send Project Object
	    Message<Project> message2 = new Message<>("Project", project);
	    messageSender.send(message2);
	}

}
