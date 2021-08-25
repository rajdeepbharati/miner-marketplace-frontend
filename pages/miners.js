import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Heading,
  Stack,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  VStack,
  HStack,
  Link,
  Tag,
  // Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
  CheckboxGroup,
  Checkbox,
  Circle,
  Spacer,
} from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import { Icon, IconProps, Search2Icon } from "@chakra-ui/icons";
import Select from "react-select";
import { isMobile } from "react-device-detect";

import DashboardMenu from "../components/dashboard/DashboardMenu";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import MinerListingNavbar from "../components/dashboard/MinerListingNavbar";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { createHttpLink } from "apollo-link-http";
import { TableProps } from "antd/lib/table";
import "antd/dist/antd.css";
import Head from "next/head";
import NxLink from "next/link";
import { Table, Space } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

import { useRouter } from "next/router";

import {
  GetFormattedStorageUnits,
  GetFormattedFILUnits,
  GetSimpleFILUnits,
  GetSimpleUSDUnits,
} from "../util/util";
import { Countries } from "../util/raw";
import Base from "antd/lib/typography/Base";
import * as Fathom from "fathom-client";

let countries = Countries();

export default function Miners({ filecoinToUSDRate, miners, href }) {
  // useEffect(() => {
  //   fetch(
  //     "https://api.coingecko.com/api/v3/simple/price?ids=filecoin&vs_currencies=usd"
  //   )
  //     .then((res) => res.json())
  //     .then((r) => {
  //       // console.log(r.filecoin.usd);
  //       setFilecoinUSDRate(r.filecoin.usd);
  //     });
  // }, []);
  const [filecoinUSDRate, setFilecoinUSDRate] = useState(filecoinToUSDRate);

  const router = useRouter();
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };

  const [storageDuration, setStorageDuration] = useState(6);
  const [storageAmount, setStorageAmount] = useState(10);
  const [storageDurationText, setStorageDurationText] = useState(6);
  const [storageAmountText, setStorageAmountText] = useState(10);

  const [pagination, setPagination] = useState({});
  // const [filteredInfo, setFilteredInfo] = useState({});
  // const [sortedInfo, setSortedInfo] = useState(null);

  // const handleTableChange = (pagination, filters, sorter) => {
  //   setPagination(pagination);
  // };
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  function handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  }

  function handleReset(clearFilters) {
    clearFilters();
    setSearchText("");
  }

  const dataSource = miners.map((fd) => {
    let serviceTypeArr = [];
    if (fd.service.serviceTypes.storage) {
      serviceTypeArr.push("Storage");
    }
    if (fd.service.serviceTypes.retrieval) {
      serviceTypeArr.push("Retrieval");
    }
    if (fd.service.serviceTypes.repair) {
      serviceTypeArr.push("Repair");
    }
    let dataTransferMechanismArr = [];
    if (fd.service.dataTransferMechanism.online) {
      dataTransferMechanismArr.push("Online");
    }
    if (fd.service.dataTransferMechanism.offline) {
      dataTransferMechanismArr.push("Offline");
    }
    let minerName = fd.personalInfo.name;
    if (fd.personalInfo.name == "") {
      minerName = "Unclaimed profile";
    }

    let storageAskPrice = fd.pricing.storageAskPrice;
    if (
      isNaN(fd.pricing.storageAskPrice) ||
      fd.pricing.storageAskPrice == null ||
      fd.pricing.storageAskPrice == ""
    ) {
      // console.log(
      //   "fd.pricing.storageAskPrice invalid",
      //   fd.pricing.storageAskPrice
      // );
      storageAskPrice = 0; // show zero for miners who haven't mentioned askPrice
    }
    return {
      key: fd.id,
      // sno: 1,
      miner: {
        id: fd.id,
        name: minerName,
      },
      reputationScore: fd.reputationScore,
      transparencyScore: fd.transparencyScore,
      serviceType: serviceTypeArr,
      dataTransferMechanism: dataTransferMechanismArr,
      location: {
        country: fd.location.country,
        region: fd.location.region,
      },
      estimatedQuote: {
        fil:
          storageDuration *
          30 *
          2880 *
          storageAmount *
          (parseInt(storageAskPrice) / 10 ** 18),
        display: GetSimpleFILUnits(
          storageDuration *
            30 *
            2880 *
            storageAmount *
            parseInt(storageAskPrice)
        ),
        usd:
          storageDuration *
          30 *
          2880 *
          storageAmount *
          (parseInt(storageAskPrice) / 10 ** 18) *
          filecoinUSDRate,
        displayUSD: GetSimpleUSDUnits(
          storageDuration *
            30 *
            2880 *
            storageAmount *
            (parseInt(storageAskPrice) / 10 ** 18) *
            filecoinUSDRate
        ),
      },
      qap: {
        val: fd.qualityAdjustedPower,
        display: GetFormattedStorageUnits(fd.qualityAdjustedPower),
      },
    };
  });

  const mLocations = [
    { text: "Asia", value: "Asia" },
    { text: "Europe", value: "Europe" },
    { text: "Africa", value: "Africa" },
    { text: "Oceania", value: "Oceania" },
    { text: "South America", value: "South America" },
    { text: "Central America", value: "Central America" },
    { text: "North America", value: "North America" },
  ];

  const columns = [
    {
      title: "Storage Providers",
      dataIndex: "miner",
      key: "miner",
      render: (m) => {
        return (
          <div>
            <Link href={`/miners/${m.id}`} key={m.id} isExternal>
              <Text fontSize="lg" color="blue.700">
                {m.name}
              </Text>
              <Text
                color="blue.500"
                fontWeight="semibold"
                textDecoration="underline"
              >
                {m.id}
              </Text>
            </Link>
            {/*<a
              onClick={() => {
                router.push({
                  pathname: "/miners/[id]",
                  query: { minerId: m.id },
                });
              }}
            >
              <b>{m.id}</b>
            </a>*/}
          </div>
        );
      },
    },
    {
      title: "Reputation Score",
      dataIndex: "reputationScore",
      key: "reputationScore",
      defaultSortOrder: "descend",
      sorter: {
        compare: (a, b) =>
          parseInt(a.reputationScore) - parseInt(b.reputationScore),
      },
      render: (reputationScore) => {
        var color = reputationScore < 50 ? "gray.500" : "blue.600";
        return (
          <Text color={color} fontSize="lg">
            {reputationScore}
          </Text>
        );
      },
    },
    {
      title: "Transparency Score",
      dataIndex: "transparencyScore",
      key: "transparencyScore",
      sorter: {
        compare: (a, b) =>
          parseInt(a.transparencyScore) - parseInt(b.transparencyScore),
      },
      render: (transparencyScore) => {
        var color = transparencyScore < 50 ? "orange.600" : "blue.700";
        return (
          <Text color={color} fontSize="lg">
            {transparencyScore}
          </Text>
        );
      },
    },
    {
      title: "Type of Service",
      dataIndex: "serviceType",
      key: "serviceType",
      filters: [
        { text: "Storage", value: "Storage" },
        { text: "Retrieval", value: "Retrieval" },
        { text: "Repair", value: "Repair" },
      ],
      onFilter: (value, record) => {
        //console.log("VR", value, record);
        return record.serviceType.includes(value);
      },
      render: (serviceTypes) => (
        <HStack spacing="2">
          {serviceTypes.map((service) => {
            let tagColor = "gray.700";
            let tagBg = "gray.100";
            if (service === "Storage") {
              tagColor = "blue.700";
              let tagBg = "blue.50";
            } else if (service === "Retrieval") {
              tagColor = "purple.700";
              tagBg = "purple.50";
            }
            return (
              <Tag color={tagColor} bg={tagBg} borderRadius="full">
                {service}
              </Tag>
            );
          })}
        </HStack>
      ),
    },
    {
      title: "Data Transfer Mechanism",
      dataIndex: "dataTransferMechanism",
      key: "dataTransferMechanism",
      filters: [
        { text: "Online", value: "Online" },
        { text: "Offline", value: "Offline" },
      ],
      onFilter: (value, record) => record.dataTransferMechanism.includes(value),
      render: (dataTransferMechanism) =>
        dataTransferMechanism.map((datatype) => {
          let color = "gray.500";
          if (datatype === "Online") {
            color = "green.500";
          }
          return (
            <HStack>
              {/* <Circle size="0.8rem" bg={color} /> */}
              <Text color={color}>{datatype}</Text>
            </HStack>
          );
        }),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      filters: mLocations,
      // https://gist.githubusercontent.com/ssskip/5a94bfcd2835bf1dea52/raw/3b2e5355eb49336f0c6bc0060c05d927c2d1e004/ISO3166-1.alpha2.json
      // filters: [
      //   { text: "SG", value: "SG" },
      //   { text: "IN", value: "IN" },
      //   { text: "CN", value: "CN" },
      //   { text: "NL", value: "NL" },
      //   { text: "CA", value: "CA" },
      // ],
      onFilter: (value, record) => {
        return (
          record.location.country.includes(value) ||
          record.location.region.includes(value)
        );
      },
      render: (l) => {
        return (
          <div color="gray.600">
            <Text>{countries[l.country]}</Text>
            {l.region && <Text fontSize="sm">({l.region})</Text>}
            {!l.region && <Text fontSize="sm">-</Text>}
          </div>
        );
      },
    },
    {
      title: "Estimated Quote",
      dataIndex: "estimatedQuote",
      key: "estimatedQuote",
      sorter: {
        compare: (a, b) => a.estimatedQuote.fil - b.estimatedQuote.fil,
        // parseInt(a.estimatedQuote.fil) - parseInt(b.estimatedQuote.fil),
      },
      render: (l) => {
        return (
          <div>
            <Text fontSize="larger" fontWeight="medium" color="gray.600">
              {/*{Math.round((l.fil + Number.EPSILON) * 1000) / 1000} FIL*/}
              {l.display}
            </Text>
            <Text color="gray.500">{l.displayUSD}</Text>
          </div>
        );
      },
    },
    {
      title: "QAP",
      dataIndex: "qap",
      key: "qap",
      sorter: {
        compare: (a, b) => parseInt(a.qap.val) - parseInt(b.qap.val),
      },
      render: (l) => {
        return (
          <>
            {/* {!l.display && (<p>{l.display}</p>)} */}
            {l.display == "NaN YB" ? <p>-</p> : <p>{l.display}</p>}
          </>
        );
      },
    },
  ];

  const [minerIdQuery, setMinerIdQuery] = useState("");
  const [filteredMiners, setFilteredMiners] = useState(dataSource);
  const filterList = (event) => {
    let mminers = dataSource;
    let q = minerIdQuery;
    if (q == "") {
      // console.log("");
    }
    mminers = mminers.filter(function (m) {
      // console.log("m", m.miner.id, "ido", m.miner.id.indexOf(q), "q", q);
      return m.miner.id.toLowerCase().indexOf(q) != -1; // returns true or false
      // return m.miner.id.includes(q);
    });

    // console.log("MMiners", mminers);
    setFilteredMiners(mminers);
  };
  const onChange = (event) => {
    // console.log(
    //   "qupdated",
    //   minerIdQuery,
    //   "q",
    //   event.target.value,
    //   "qlc",
    //   event.target.value.toLowerCase()
    // );

    const q = event.target.value.toLowerCase();
    // if (q == "") {
    //   console.log("qempty");
    //   setFilteredMiners(miners);
    // } else {
    setMinerIdQuery(event.target.value);
    filterList(event);
    // }
  };

  /* Options for Select Component */
  const mServices = [
    { label: "Storage", value: "Storage" },
    { label: "Retrieval", value: "Retrieval" },
    { label: "Repair", value: "Repair" },
  ];

  const mDataMechanism = [
    { label: "Online", value: "Online" },
    { label: "Offline", value: "Offline" },
  ];

  const mLocationSelect = [
    { label: "Asia", value: "Asia" },
    { label: "Europe", value: "Europe" },
    { label: "Africa", value: "Africa" },
    { label: "Oceania", value: "Oceania" },
    { label: "South America", value: "South America" },
    { label: "Central America", value: "Central America" },
    { label: "North America", value: "North America" },
  ];

  const dStorageUnitsArr = [
    { label: "MB", value: "MB" },
    { label: "GB", value: "GB" },
    { label: "TB", value: "TB" },
    { label: "PB", value: "PB" },
  ];
  const dStorageDurationUnitsArr = [
    { label: "Months", value: "Months" },
    { label: "Years", value: "Years" },
  ];

  const [dStorageUnits, setDStorageUnits] = useState(dStorageUnitsArr[1]);
  const [dStorageDurationUnits, setDStorageDurationUnits] = useState(
    dStorageDurationUnitsArr[0]
  );

  const handleStorageUnitsChange = (event) => {
    console.log("setDStorageUnits", dStorageUnits, event);
    setDStorageUnits(event);

    let finalSA = storageAmountText;
    console.log("storageAmountText", storageAmountText);
    if (event.value == "MB") {
      finalSA *= 0.001 * 0.931323;
    } else if (event.value == "GB") {
      finalSA *= 0.931323;
    } else if (event.value == "TB") {
      finalSA *= 1000 * 0.931323;
    } else if (event.value == "PB") {
      finalSA *= 1000000 * 0.931323;
    }
    console.log("finalSA", finalSA);
    setStorageAmount(finalSA);
  };
  const handleStorageDurationUnitsChange = (event) => {
    console.log("setDStorageDurationUnits", dStorageDurationUnits, event);
    setDStorageDurationUnits(event);

    let finalSD = storageDurationText;
    console.log("storageDurationText", storageDurationText);
    if (event.value == "Years") {
      // && dStorageDurationUnits.value != "Years") {
      finalSD *= 12;
    }
    console.log("finalSD", finalSD);
    setStorageDuration(finalSD);
  };

  const customStyles = {
    control: (Base) => ({
      ...Base,
      backgroundColor: "#F7FAFC",
      width: "6.4rem",
      height: "2.5rem",
      borderRadius: "0rem 0.4rem 0.4rem 0rem",
      borderLeft: "none",
      borderColor: "#E2E8F0",
    }),
  };

  const customStylesAlt = {
    control: (Base) => ({
      ...Base,
      height: "2rem",
      borderRadius: "0.4rem",

      borderColor: "#E2E8F0",
    }),
  };

  function track() {
    if (typeof window != "undefined") {
      Fathom.trackGoal("HACMMY00", 0);
    }
  }

  const [quoteAlert, showQuoteAlert] = useState("none");

  if (isMobile) {
    return (
      <>
        <Stack textAlign="center" alignItems="center" mt="24" p="4">
          <Image src="/images/Logo-b.svg" alt="datastation logo" maxW="60vw" />
          <Heading size="xl" color="blue.800" pt="12">
            Device Not Supported
          </Heading>
          <Text size="md" color="gray.700" maxW="80%">
            Please visit DataStation via a personal Computer or a Laptop device
          </Text>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Storage Provider Listing - DataStation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {/* <DashboardNavbar isMinerProfile={false} /> */}

      <MinerListingNavbar />
      <Grid
        templateColumns={{
          lg: "repeat(12, 1fr)",
          md: "repeat(6,1fr)",
        }}
        // mx="24"
      >
        <GridItem colSpan="12" pt="28" bg="white" px="8">
          <Flex justifyContent="space-between">
            <Stack spacing="8" w="36rem">
              <Heading color="gray.700" size="lg">
                Search Storage Providers
              </Heading>
              <Stack spacing="4" pb="4">
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="visible"
                    children={<Search2Icon w={5} h={5} color="gray.400" />}
                  />
                  <Input
                    type="text"
                    size="md"
                    placeholder="Search by Storage Provider ID (Miner ID)"
                    value={minerIdQuery}
                    onChange={onChange}
                  />
                </InputGroup>
              </Stack>
            </Stack>

            <GridItem colSpan="4" bg="white" px="8">
              <Stack bg="gray.100" borderRadius="xl" p="6">
                <HStack spacing="4" alignItems="flex-end" pb="2">
                  <Stack spacing="2">
                    <Heading size="md" fontWeight="semibold" color="gray.700">
                      Estimated Quote
                    </Heading>
                    <Text fontWeight="medium" color="gray.700">
                      Storage Amount
                    </Text>
                    <InputGroup
                      height="fit-content"
                      alignContent="center"
                      alignItems="center"
                    >
                      <Input
                        bg="white"
                        type="number"
                        w="36"
                        placeholder={"Storage amount in " + dStorageUnits.value}
                        value={storageAmountText}
                        onChange={(event) => {
                          console.log("amt changed");
                          let finalSA = event.target.value;
                          setStorageAmountText(event.target.value);
                          if (dStorageUnits.value == "MB") {
                            finalSA *= 0.001 * 0.931323;
                          } else if (dStorageUnits.value == "GB") {
                            finalSA *= 0.931323;
                          } else if (dStorageUnits.value == "TB") {
                            finalSA *= 1000 * 0.931323;
                          } else if (dStorageUnits.value == "PB") {
                            finalSA *= 1000000 * 0.931323;
                          }
                          console.log("finalSA", finalSA);

                          setStorageAmount(finalSA);
                          console.log(
                            "storageAmount",
                            storageAmount,
                            event.target.value
                          );
                          console.log("dStorageUnits", dStorageUnits);
                          console.log(
                            "dStorageDurationUnits",
                            dStorageDurationUnits
                          );
                        }}
                        borderRight="none"
                        borderRadius="0.4rem 0rem 0rem 0.4rem"
                      />

                      <Select
                        options={dStorageUnitsArr}
                        value={dStorageUnits}
                        onChange={handleStorageUnitsChange}
                        // defaultValue={dStorageUnitsArr[1]}
                        isClearable={false}
                        isSearchable={false}
                        styles={customStyles}
                      />
                    </InputGroup>
                  </Stack>
                  <Stack spacing="1">
                    <Text fontWeight="medium" color="gray.700">
                      Storage Duration
                    </Text>
                    <InputGroup>
                      <Input
                        bg="white"
                        type="number"
                        w="36"
                        placeholder={
                          "Storage duration in " + dStorageDurationUnits.value
                        }
                        value={storageDurationText}
                        onChange={(event) => {
                          console.log("dur changed");
                          let finalSD = event.target.value;
                          setStorageDurationText(event.target.value);
                          if (dStorageDurationUnits.value == "Years") {
                            finalSD *= 12;
                          }
                          console.log("finalSD", finalSD);

                          setStorageDuration(finalSD);
                          console.log(
                            "storageDuration",
                            storageDuration,
                            event.target.value
                          );
                          console.log("dStorageUnits", dStorageUnits);
                          console.log(
                            "dStorageDurationUnits",
                            dStorageDurationUnits
                          );
                        }}
                        borderRight="none"
                        borderRadius="0.4rem 0rem 0rem 0.4rem"
                      />
                      <Select
                        options={dStorageDurationUnitsArr}
                        value={dStorageDurationUnits}
                        onChange={handleStorageDurationUnitsChange}
                        // defaultValue={dStorageDurationUnitsArr[0]}
                        isClearable={false}
                        isSearchable={false}
                        styles={customStyles}
                      />
                    </InputGroup>
                  </Stack>
                </HStack>
                <Button
                  w="fit-content"
                  colorScheme="blue"
                  variant="solid"
                  borderRadius="full"
                  px="6"
                  onClick={(event) => {
                    filterList(event);
                    track();
                    showQuoteAlert("visible");
                  }}
                >
                  Update Estimated Quote
                </Button>
                <Alert
                  status="info"
                  borderRadius="lg"
                  bg="none"
                  display={quoteAlert}
                >
                  <HStack>
                    <AlertIcon color="gray.600" />
                    <AlertDescription fontWeight="medium">
                      See updated Quote in the Estimated Quote column below
                    </AlertDescription>
                  </HStack>
                </Alert>
              </Stack>
            </GridItem>
          </Flex>
          <HStack
          //py={8}
          //w="full"
          //justifyContent="space-between"
          //alignItems="top"
          >
            {/* <VStack alignItems="left" w="20rem">
              <Heading size="sm" fontWeight="medium" color="gray.700">
                Type of Service
              </Heading>
              <Select
                closeMenuOnSelect={true}
                options={mServices}
                styles={customStylesAlt}
                isMulti
              />
            </VStack> */}

            {/* <VStack alignItems="left" w="20rem">
              <Heading size="sm" fontWeight="medium" color="gray.700">
                Data Transfer Mechanism
              </Heading>
              <Select
                options={mDataMechanism}
                styles={customStylesAlt}
                isMulti
              />
            </VStack> */}

            {/* <VStack alignItems="left" w="20rem">
              <Heading size="sm" fontWeight="medium" color="gray.700">
                Location
              </Heading>
              <Select
                options={mLocationSelect}
                onInputChange={(event) => {
                  // console.log("inputchange", event)
                }}
                onChange={(event) => {
                  console.log("justchange", event);
                }}
                styles={customStylesAlt}
                isMulti
              />
            </VStack> */}
          </HStack>
        </GridItem>
        <GridItem colSpan="12" px="8">
          <Stack spacing="8" mt="6">
            <Table
              columns={columns}
              dataSource={filteredMiners}
              // onChange={handleTableChange}
              // pagination={pagination}
              pagination={{ defaultPageSize: 50 }}
              scroll={{ y: 480 }}
            />
          </Stack>
        </GridItem>
      </Grid>
    </>
  );
}
// getServerSideProps
// getStaticProps
export async function getServerSideProps() {
  console.log(process.env.BACKEND_URL);
  const client = new ApolloClient({
    uri: process.env.BACKEND_URL,
    cache: new InMemoryCache(),
  });
  const { data: fmmData } = await client.query({
    query: gql`
      query {
        miners(first: 10000) {
          id
          claimed
          personalInfo {
            name
          }
          reputationScore
          transparencyScore
          location {
            country
            region
          }
          service {
            serviceTypes {
              storage
              retrieval
              repair
            }
            dataTransferMechanism {
              online
              offline
            }
          }
          pricing {
            storageAskPrice
          }
          qualityAdjustedPower
        }
      }
    `,
  });

  let res1 = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=filecoin&vs_currencies=usd"
  );
  console.log("ressssS", res1);
  const res2 = await res1.json();
  console.log("rjsoon", res2);
  console.log("fusd", res2.filecoin.usd);
  // .then((res) => res.json())
  // .then((r) => {
  //   // console.log(r.filecoin.usd);
  //   setFilecoinUSDRate(r.filecoin.usd);
  // });

  return {
    props: {
      filecoinToUSDRate: res2.filecoin.usd,
      miners: fmmData.miners,
    },
  };
}
