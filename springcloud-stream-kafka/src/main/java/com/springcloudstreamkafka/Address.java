package com.springcloudstreamkafka;

import lombok.Data;

@Data
public class Address {


    private Long id;


    private String streetName;


    private String apartmentOrHouseNumber;


    private String city;


    private Long zipcode;


    private String state;


    private String country;


    public Address() {
        super();
        id = 0L;
    }


    public Address(Long id, String streetName, String apartmentOrHouseNumber, String city, Long zipcode,
                   String state, String country) {
        super();
        this.id = id;
        this.streetName = streetName;
        this.apartmentOrHouseNumber = apartmentOrHouseNumber;
        this.city = city;
        this.zipcode = zipcode;
        this.state = state;
        this.country = country;
    }



}
